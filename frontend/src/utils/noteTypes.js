// Labels and routes for credit notes and debit notes, so one set of pages serves both.
const NOTE_TYPES = {
    credit: {
        type: "credit",
        title: "Credit Note",
        plural: "Credit Notes",
        short: "CN",
        createUrl: "/create-credit-note",
        listUrl: "/view-credit-notes",
        detailsUrl: (id) => `/view-credit-note/details?id=${id}&back=true`,
        effect: "Reduces what the party owes — returns, discounts or over-billing on an invoice.",
        grandLabel: "Total credit",
        tone: "green",
    },
    debit: {
        type: "debit",
        title: "Debit Note",
        plural: "Debit Notes",
        short: "DN",
        createUrl: "/create-debit-note",
        listUrl: "/view-debit-notes",
        detailsUrl: (id) => `/view-debit-note/details?id=${id}&back=true`,
        effect: "Adds to what the party owes — under-billing or extra charges on an invoice.",
        grandLabel: "Total debit",
        tone: "amber",
    },
};

export const noteConfig = (type) => NOTE_TYPES[type] || NOTE_TYPES.credit;

export default NOTE_TYPES;
