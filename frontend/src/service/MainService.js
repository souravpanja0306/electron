module.exports.handleEnter = ({
    event = "",
    name = "",
    index = 0
}) => {
    if (event.key === "Enter") {
        event.preventDefault();
        const form = event.target.form;
        const target = form?.elements?.[name];
        if (!target) return;
        if (target.length > 0) {
            target[index]?.focus();
        } else {
            target.focus();
        };
    };
};