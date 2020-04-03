(function (win) {
    var e = React.createElement;
    window.pf = {};

    function TodoItem(props) {
        return e("li", null, props.text);
    }

    var AppLayout = function(props) {
        return e("div", null, "Test");
    };

    var TodoApp = createReactClass({
        getInitialState: function () {
            return { items: [], text: "" };
        },

        handleEditInput: function (evt) {
            this.setState({ text: evt.target.value });
        },

        handleSubmit: function (evt) {
            evt.preventDefault();
            if (!this.state.text.length) return;
            this.setState(function (prevState) {
                return {
                    items: prevState.items.concat({
                        id: Math.random() + "",
                        text: prevState.text
                    }),
                    text: ""
                };
            });
        },

        render: function () {
            return e("div", null, [
                e("h1", { key: "title" }, "To Do List"),
                e("input", {
                    key: "input",
                    type: "text",
                    value: this.state.text,
                    onChange: this.handleEditInput
                }),
                e(
                    "button",
                    { key: "add-todo-btn", onClick: this.handleSubmit },
                    "Add ToDo"
                ),
                e(
                    "ul",
                    { key: "todos" },
                    this.state.items.map(item =>
                        e(TodoItem, { key: item.id, text: item.text })
                    )
                )
            ]);
        }
    });

    window.pf.run = function(element) {
        ReactDOM.render(e(AppLayout), element);
    };
})(window);
