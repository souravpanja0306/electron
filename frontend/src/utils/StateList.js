/**
 * Indian States and Union Territories with their GST state codes
 * (the first two digits of a GSTIN).
 * `title`/`value` are kept for existing callers; `code` is the GST state code.
 */
const StateList = [
    // States
    { title: "Andhra Pradesh", value: "Andhra Pradesh", code: "37" },
    { title: "Arunachal Pradesh", value: "Arunachal Pradesh", code: "12" },
    { title: "Assam", value: "Assam", code: "18" },
    { title: "Bihar", value: "Bihar", code: "10" },
    { title: "Chhattisgarh", value: "Chhattisgarh", code: "22" },
    { title: "Goa", value: "Goa", code: "30" },
    { title: "Gujarat", value: "Gujarat", code: "24" },
    { title: "Haryana", value: "Haryana", code: "06" },
    { title: "Himachal Pradesh", value: "Himachal Pradesh", code: "02" },
    { title: "Jharkhand", value: "Jharkhand", code: "20" },
    { title: "Karnataka", value: "Karnataka", code: "29" },
    { title: "Kerala", value: "Kerala", code: "32" },
    { title: "Madhya Pradesh", value: "Madhya Pradesh", code: "23" },
    { title: "Maharashtra", value: "Maharashtra", code: "27" },
    { title: "Manipur", value: "Manipur", code: "14" },
    { title: "Meghalaya", value: "Meghalaya", code: "17" },
    { title: "Mizoram", value: "Mizoram", code: "15" },
    { title: "Nagaland", value: "Nagaland", code: "13" },
    { title: "Odisha", value: "Odisha", code: "21" },
    { title: "Punjab", value: "Punjab", code: "03" },
    { title: "Rajasthan", value: "Rajasthan", code: "08" },
    { title: "Sikkim", value: "Sikkim", code: "11" },
    { title: "Tamil Nadu", value: "Tamil Nadu", code: "33" },
    { title: "Telangana", value: "Telangana", code: "36" },
    { title: "Tripura", value: "Tripura", code: "16" },
    { title: "Uttarakhand", value: "Uttarakhand", code: "05" },
    { title: "Uttar Pradesh", value: "Uttar Pradesh", code: "09" },
    { title: "West Bengal", value: "West Bengal", code: "19" },

    // Union Territories
    { title: "Andaman and Nicobar Islands", value: "Andaman and Nicobar Islands", code: "35" },
    { title: "Chandigarh", value: "Chandigarh", code: "04" },
    { title: "Dadra and Nagar Haveli and Daman and Diu", value: "Dadra and Nagar Haveli and Daman and Diu", code: "26" },
    { title: "Delhi", value: "Delhi", code: "07" },
    { title: "Jammu and Kashmir", value: "Jammu and Kashmir", code: "01" },
    { title: "Ladakh", value: "Ladakh", code: "38" },
    { title: "Lakshadweep", value: "Lakshadweep", code: "31" },
    { title: "Puducherry", value: "Puducherry", code: "34" },
];

/** State name for a GST state code ("19" -> "West Bengal"), or "" if unknown. */
export const stateFromGstCode = (code) => StateList.find((s) => s.code === code)?.value || "";

export default StateList;
