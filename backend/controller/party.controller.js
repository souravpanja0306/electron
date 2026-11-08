// Services / helpers...
const PartyService = require("../service/party.service");
const { errorHandler, ok, toId, serverError } = require("../helper/http");
const { pickBusiness, validateBusiness, countReferences, describeReferences } = require("../helper/business");
const { saveLogo, removeLogo, discardUpload } = require("../helper/upload");
const { uploadUrl } = require("../helper/html");

const withLogoUrl = (party) => ({ ...party, logo: uploadUrl("party", party.logo) });

// The party with this id, if it belongs to the signed-in user.
const findOwnParty = async (id, userId) => (await PartyService.getParty({ id, created_by: userId }))[0] || null;

module.exports.addParty = async (req, res) => {
    try {
        const { t_userId } = req.body;
        const data = pickBusiness(req.body);
        const invalid = validateBusiness(data, "Party name");
        if (invalid) {
            discardUpload(req.file);
            return errorHandler(res, 400, invalid);
        };

        const finalData = { ...data, created_by: t_userId };
        if (req.file) finalData.logo = saveLogo(req.file, "party");

        const result = await PartyService.createParty(finalData);
        return ok(res, "Party created successfully.", { ...result, id: Number(result.lastInsertRowid) });
    } catch (error) {
        discardUpload(req.file);
        return serverError(res, "controller: addParty", error, "Could not create the party.");
    };
};

module.exports.listParty = async (req, res) => {
    try {
        const { t_userId } = req.body;
        const search_key = { created_by: t_userId };
        if (req.query.id) {
            const id = toId(req.query.id);
            if (!id) return errorHandler(res, 400, "Invalid party ID.");
            search_key.id = id;
        };

        const result = await PartyService.getParty(search_key);
        if (!result.length) return res.status(202).json({ status: 202, message: "Data not found.", body: [] });
        return ok(res, "Data fetched successfully.", result.map(withLogoUrl));
    } catch (error) {
        return serverError(res, "controller: listParty", error, "Could not load parties.");
    };
};

module.exports.removeParty = async (req, res) => {
    try {
        const { t_userId } = req.body;
        const id = toId(req.params.id);
        if (!id) return errorHandler(res, 400, "ID is required.");

        const party = await findOwnParty(id, t_userId);
        if (!party) return errorHandler(res, 404, "Party not found.");

        // Deleting a party that documents still point at would leave them without a party.
        const usedBy = describeReferences(countReferences("party", id));
        if (usedBy) return errorHandler(res, 409, `This party is used on ${usedBy}. Delete those first, or keep the party.`);

        const result = await PartyService.deleteParty({ ids: [id] });
        if (!result.changes) return errorHandler(res, 404, "Party not found.");
        removeLogo(party.logo, "party");
        return ok(res, "Party deleted successfully.", result);
    } catch (error) {
        return serverError(res, "controller: removeParty", error, "Could not delete the party.");
    };
};

module.exports.editParty = async (req, res) => {
    try {
        const { t_userId } = req.body;
        const id = toId(req.params.id);
        if (!id) {
            discardUpload(req.file);
            return errorHandler(res, 400, "ID is required.");
        };

        const party = await findOwnParty(id, t_userId);
        if (!party) {
            discardUpload(req.file);
            return errorHandler(res, 404, "Party not found.");
        };

        // Fields the client didn't send keep their saved value.
        const data = pickBusiness(req.body, { partial: true });
        const invalid = validateBusiness(data, "Party name");
        if (invalid) {
            discardUpload(req.file);
            return errorHandler(res, 400, invalid);
        };

        if (req.file) {
            data.logo = saveLogo(req.file, "party");
        } else if (req.body.remove_logo === "1") {
            data.logo = "";
        };

        if (!Object.keys(data).length) return res.status(202).json({ status: 202, message: "Nothing to update.", body: [] });

        const result = await PartyService.updateParty(id, data);
        if ("logo" in data && party.logo && party.logo !== data.logo) removeLogo(party.logo, "party");
        return ok(res, "Party updated successfully.", result);
    } catch (error) {
        discardUpload(req.file);
        return serverError(res, "controller: editParty", error, "Could not update the party.");
    };
};
