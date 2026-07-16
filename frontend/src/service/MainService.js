module.exports.handleEnter = ({
    event = "",
    name = "",
    index = 0
}) => {
    if (event.key === "Enter") {
        event.preventDefault();
        const form = event.target.form;
        if (form.elements[name].length > 0) {
            form.elements[name][index]?.focus();
        } else {
            form.elements[name]?.focus();
        };
    };
};