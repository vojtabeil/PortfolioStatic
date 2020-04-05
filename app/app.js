(function (pf) {
    var e = React.createElement;

    function TodoItem(props) {
        return e("li", null, props.text);
    }
 
    var Card = function(props) {
        return e("div", { className : "card" }, [
            e("div", { key: "background", className: "card-background", style: { backgroundImage: "url('" + props.item.image + "')" } }),
            e("div", { key: "description", className: "card-description" }, [
                e("h3", { key: "title" }, props.item.title),
                e("p", { key: "subtitle" }, props.item.subtitle)
                ])
            ]);
    };

    var CardCollection = function(props) {
        return e("div", { className: "card-collection"},
            props.items.map(function(n) { return e() } )
        );
    };
      
    var CardGroup = function(props) {
        return e("div", {}, [
            e("h2", {key: "header"}, props.group),
            e(CardCollection, {key: "collection", items: props.items})
        ]);
    }

    var AppLayout = function(props) {
        return e("div", null, [
            e(Card, {key: "card", item: pf.items[0]}),
            e("div", {key: "cardstssty"}, "Tewt")
            ]);
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

    pf.run = function(element) {
        ReactDOM.render(e(AppLayout), element);
    };
})(window.pf);
