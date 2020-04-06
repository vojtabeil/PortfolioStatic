(function (pf) {
    var e = React.createElement;

    pf.hash = '-';
    pf.appRef = React.createRef();

    var navigate = function() {
        var hash = window.location.hash;
        if (hash == pf.hash) {
            return;
        }

        pf.hash = hash;
        var id = hash.substr(2);

        for(var i = 0; i < pf.items.length; i++) {
            if (pf.items[i].id == id) {
                load(pf.items[i]);
            }
        }
    };

    var load = function(item) {
        if (pf.loading) {
            return;
        }

        var xhttp;
        if (window.XMLHttpRequest) {
            xhttp = new XMLHttpRequest();
        } else {
            xhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }

        pf.appRef.current.setLoading(true);

        xhttp.onerror = function() {
            pf.appRef.current.setLoading(false);
        }

        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                var content = this.responseText;
                if (item.url.indexOf("ext") !== -1) {
                    content = content.split(item.id + "-image").join("ext/" + item.id + "-image");
                }
                pf.appRef.current.setContent(content);
            }
        };

        xhttp.open("GET", item.url, true);
        xhttp.send();
    };
    
    window.setInterval(navigate, 200);
    window.addEventListener("hashchange", navigate);

    var navigateClick = function(event) {
        var id = event.currentTarget.dataset.id;
        window.location.hash = "#!" + id;
    };
 
    var Card = function(props) {
        return e("div", {className: "card-container"},
            e("div", { className : "card", "data-id" : props.item.id, onClick: navigateClick }, [
                e("div", { key: "background", className: "card-background", style: { backgroundImage: "url('" + (props.item.image || "") + "')" } }),
                e("div", { key: "description", className: "card-description" }, [
                    e("h3", { key: "title" }, props.item.title),
                    e("p", { key: "subtitle" }, props.item.subtitle)
                    ])
                ])
        );
    };

    var CardCollection = function(props) {
        return e("div", { className: "card-collection"},
            props.items.map(function(n) { return e(Card, { key: n.id, item: n }) } )
        );
    };
      
    var CardGroup = function(props) {
        return e("div", {}, [
            e("h2", {key: "header"}, props.group),
            e(CardCollection, {key: "collection", items: props.items})
        ]);
    }

    var App = createReactClass({
        getInitialState: function() {
            return { 
                tab: "all", sort: "date", tag: null, 
                displayPrivate: false, clickCount: 0, showDebugMenu: false,
                showMenu: true,
                selectedItem: pf.items[0], 
                loading: false, html: ""};
        },
        render: function() {
            var menu = [];

            menu.push(this.renderSelection());

            if (this.state.showDebugMenu) {
                menu.push(this.renderDebugMenu());
            }

            if (this.state.tab == "all") {
                menu.push(this.renderTabAll());
            } else if (this.state.tab == "tags") {
                menu.push(this.renderTabTags());
            } else if (this.state.tab == "selection") {
                menu.push(this.renderTabSelection());
            }

            return e("div", null, [
                e("div", {key: "overlay", className: "overlay"}, [
                    e("header", {key: "header"}, [
                        e("div", { key: "toggle-menu", className: "menu-toggle" }, "[toggle]"),
                        e("h1", {key: "title"}, this.state.selectedItem.title),
                        e("div", {key: "nav", className: "nav"}, [
                            e("span", {key: "prev"}, "<"),
                            e("span", {key: "next"}, ">")
                        ])
                    ]),
                    e("menu", {key: "menu", className: this.state.showMenu ? "visible" : "hidden"}, menu)
                ]),
                e("main", {dangerouslySetInnerHTML: { __html: this.state.html}, className: this.state.loading ? "loading" : ""})
            ]);
        },
        renderSelection: function() {
            var array = [];

            array.push(e("li", {key: "all", className: this.state.tab == "all" ? "active" : "", onClick: this.setTabAll }, [
                e("img", {key: "icon", src: "app/tab-all.svg"}),
                e("span", {key: "label"}, "seznam")
            ]));
            array.push(e("li", {key: "tags", className: this.state.tab == "tags" ? "active" : "", onClick: this.setTabTags }, [
                e("img", {key: "icon", src: "app/tab-tags.svg"}),
                e("span", {key: "label"}, "tagy")
            ]));
            array.push(e("li", {key: "selection", className: this.state.tab == "selection" ? "active" : "", onClick: this.setTabSelection }, [
                e("img", {key: "icon", src: "app/tab-selection.svg"}),
                e("span", {key: "label"}, "výběr")
            ]));

            var showSort = false;

            if (this.state.tab == "all" || this.state.tab == "selection") {
                showSort = true;
            } else if (this.state.tab == "tags") {
                if (this.state.tag !== null) {
                    array.push(e("li", {key: "separator", className: "separator" }));
                    array.push(e("li", {key: "tag", className: "tag", onClick: this.clearTag }, this.state.tag));
                    showSort = true;
                }
            }

            if (showSort) {
                array.push(e("li", {key: "separator", className: "separator" }));

                array.push(e("li", {key: "abc", className: this.state.sort == "abc" ? "active" : "", onClick: this.setSortAbc }, [
                    e("img", {key: "icon", src: "app/sort-abc.svg"})
                ]));
                array.push(e("li", {key: "date", className: this.state.sort == "date" ? "active" : "", onClick: this.setSortDate }, [
                    e("img", {key: "icon", src: "app/sort-date.svg"})
                ]));
            }

            return e("ul", {key: "mode-selection", className: "mode-selection"}, array);
        },
        setTabAll: function() {
            this.setState({tab: "all", clickCount: 0});
        },
        setTabTags: function() {
            this.setState({tab: "tags", tag: null, clickCount: 0});
        },
        setTabSelection: function() {
            var newState = {tab: "selection", clickCount: this.state.clickCount + 1}; 
            if (this.state.clickCount >= 5) {
                newState.clickCount = 0;
                newState.showDebugMenu = !this.state.showDebugMenu;
            }

            this.setState(newState);
        },
        setSortAbc: function() {
            this.setState({sort: "abc"});
        },
        setSortDate: function() {
            this.setState({sort: "date"});
        },
        setTag: function(tag) {
            this.setState({tag: tag});
        },
        clearTag: function() {
            this.setState({tag: null});
        },
        clickTag: function(event) {
            var tag = event.target.dataset.tag;
            this.setTag(tag);
        },
        setLoading: function(value) {
            this.setState({loading: value});
        },
        setContent: function(html) {
            this.setState({html: html, showMenu: false});
        },
        filter: function(items, callback) {
            var result = [];
            for(var i = 0; i < items.length; i++) {
                var item = items[i];
                if (callback(item)) {
                    result.push(item);
                }
            }
            return result;
        },
        getBaseList: function() {
            var displayPrivate = this.state.displayPrivate;
            return this.filter(pf.items, function(item) {
                if (item.private || false) {
                    if (displayPrivate) {
                        return true;
                    }
                } else {
                    return true;
                }

                return false;
            });
        },
        getAllTags: function(items) {
            var tags = {};
            var i,k;
    
            for (i = 0; i < items.length; i++) {
                if (!!items[i].tags) {
                    for (var j = 0; j < items[i].tags.length; j++) {
                        var tag = items[i].tags[j];
                        if (typeof tags[tag] === "undefined") {
                            tags[tag] = { name: tag, size: 1, count: 0 };
                        }
                        tags[tag].count++;
                    }
                }
            }
    
            var result = [];
            for (k in tags) {
                if (tags.hasOwnProperty(k)) {
                    result.push(tags[k]);
                }
            }
    
            result.sort(function(a, b) { return a.count - b.count; });
    
            var count = 5;
    
            for (i = 0; i < result.length; i++) {
                result[i].size = (1 + i * count / result.length) | 0;
            }
    
            result.sort(function(a, b) { return a.name.localeCompare(b.name); });
    
            return result;
    
        },
        renderTabAll: function() {
            var list = this.getBaseList();
            return this.renderList(list);
        },
        renderTabTags: function() {
            var list = this.getBaseList();

            if (this.state.tag === null) {
                var tags = this.getAllTags(list);
                var clickTag = this.clickTag;
                return e("ul", {className: "tag-list"}, tags.map(function(t) { return e("li", { key: t.name, className: "size" + t.size, onClick: clickTag, "data-tag": t.name }, t.name ); }));
            } else {

                var tag = this.state.tag;
                list = this.filter(list, function(item) {
                    for(var i = 0; i < item.tags.length; i++) {
                        if (item.tags[i] == tag) {
                            return true;
                        }
                    }
                    return false;
                });
    
                return this.renderList(list);
            }
        },
        renderTabSelection: function() {
            var list = this.getBaseList();

            list = this.filter(list, function(item) {
                for(var i = 0; i < pf.selection.items.length; i++) {
                    if (pf.selection.items[i] == item.id) {
                        return true;
                    }
                }
                return false;
            });

            return this.renderList(list);
        },
        renderList: function(items) {
            var groups = {};
            var groupList = [];

            for(var i = 0; i < items.length; i++) {
                var item = items[i];
                var group = item.title.substring(0, 1).toUpperCase();
                if (this.state.sort == "date") {
                    if ((item.year || 0) > 0) {
                        group = item.year;
                    } else {
                        group = "#";
                    }
                }

                if (!groups.hasOwnProperty(group)) {
                    groups[group] = [];
                }

                groups[group].push(item);
            }

            for(var g in groups) {
                if (groups.hasOwnProperty(g)) {
                    var group = groups[g];
                    group.sort(function(a, b) { return a.title.localeCompare(b.title); });
                    groupList.push({group: g, items: groups[g]});
                }
            }

            if (this.state.sort == "date") {
                groupList.sort(function(a, b) { return b.group - a.group; });
            } else {
                groupList.sort(function(a, b) { return a.group.localeCompare(b.group); });
            }

            return e("div", {key: "list"}, groupList.map(function(g) {
                return e(CardGroup, {key: g.group, group: g.group, items: g.items});
            }));
        },
        displayPrivateChange : function(event) {
            this.setState({displayPrivate: !!event.target.value});
        },
        renderDebugMenu: function() {
            return e("div", {key: "debug-menu", className: "debug-menu"}, [
                e("input", {key: "display-private", type: "checkbox", onChange: this.displayPrivateChange}),
                e("label", {key: "display-private-label"}, "zobrazit skryté")
            ]);
        },
    });

    pf.run = function(element) {
        ReactDOM.render(e(App, {ref: pf.appRef}), element);
    };
})(window.pf);
