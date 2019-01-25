$(function () {
    //var myTemplate = "<p>My favorite kind of cake is: {{favoriteCake}}</p>";
    //var a = Sqrl.Render(myTemplate, { favoriteCake: 'Chocolate!' });
    //alert(a);
    //return;

    var db = [];

    if (typeof window.db1 !== "undefined") {
        db = window.db1;
    } else if (typeof window.db2 !== "undefined") {
        db = window.db2;
    }

    var company = [];

    if (typeof window.company1 !== "undefined") {
        company = window.company1;
    } else if (typeof window.company2 !== "undefined") {
        company = window.company2;
    }

    var find = function(id) {
        for (var i = 0; i < db.length; i++) {
            if (db[i].Id === id) {
                return db[i];
            }
        }

        return null;
    };

    var setMenuContent = function(html) {
        $("#tab-content").html(html);
    };

    var setArticleContent = function(html) {
        $("article").html(html);
    };

    var ajax = function (url, callback) {
        var cors = function(method, url) {
            var xhr = new XMLHttpRequest();
            if ("withCredentials" in xhr) {
                xhr.open(method, url, true);

            } else if (typeof XDomainRequest !== "undefined") {
                xhr = new XDomainRequest();
                xhr.open(method, url);
            } else {
                xhr = null;
            }
            return xhr;
        };

        var req = cors('GET', url);
        req.onload = function() {
            callback(req.responseText);
        };
        req.send();
    };

    var safe = function(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    };

    var mediaMatch1 = window.matchMedia("(max-width: 400px)");
    var mediaMatch2 = window.matchMedia("(min-width: 1200px)");

    var mediaSelector = function () {
        var $main = $(document.body);

        if (mediaMatch1.matches) {
            $main.toggleClass('full', true);
            $main.toggleClass('toggle', false);
            $main.toggleClass('always', false);
        } else if (mediaMatch2.matches) {
            $main.toggleClass('full', false);
            $main.toggleClass('toggle', false);
            $main.toggleClass('always', true);
        } else {
            $main.toggleClass('full', false);
            $main.toggleClass('toggle', true);
            $main.toggleClass('always', false);
        }
    };

    mediaMatch1.addListener(mediaSelector);
    mediaMatch2.addListener(mediaSelector);
    mediaSelector();

    var updateArticle = function() {
        var hash = window.location.hash;
        if (typeof hash === "string" && hash.substr(0, 1) === "#") {
            var item = find(hash.substr(1));

            if (item === null) {
                $("article").text("Not found");
                return;
            }

            $("#title span").text(item.Title);

            if (item.Html !== null) {
                setArticleContent(item.Html);
            } else {
                var url = item.Url || "/" + item.Id + ".html";
                ajax(url,
                    function(html) {
                        item.Html = html;
                        setArticleContent(html);
                    });
            }
        }
    };

    $(window).on('hashchange', updateArticle);
    updateArticle();

    var printItemList = function (items) {

        //return Sqrl.Render("Hello" +
        //    "{{each(options.d)}}" +
        //    "{{if(@this.Year)}}<h2>{{@this.Year}}</h2>{{/if}}" +
        //    "<ul>" +
        //    "{{each(@this.Items)}}<li>{{@this.Title}}</li>{{/each}}" +
        //    "</ul>" +
        //    "{{/each}}" +
        //    ""
        //    , { d: items });

        //return Sqrl.Render("{{if(1)}}x{{/if}}", {});
        //return Sqrl.Render(
        //    "{{each(options.items)}}" +
        //    "{{@this.Year}}" +
        //    "{{if(1)}}x{{/if}}" +
        //    "{{/each}}", {items: items});

        var html = [];

        for (var i = 0; i < items.length; i++) {
            html.push("<div class='list'>");
            if (items[i].Year !== null && items[i].Year !== "null") {
                html.push("<h2>" + items[i].Year + "</h2>");
            }

            html.push("<ul>");

            for (var j = 0; j < items[i].Items.length; j++) {
                var item = items[i].Items[j];
                html.push("<li>");
                html.push("<a href='#" + item.Id + "' class='item'>");
                html.push("<h3>" + safe(item.Title) + "</h3>");
                html.push("<span>" + safe(item.SubTitle) + "</span>");
                html.push("</a>");
                html.push("</li>");
            }

            html.push("</ul>");

            html.push("</div>");
        }

        return html.join('');
    };

    var printTagList = function(tags) {
        var html = [];

        for (var i = 0; i < tags.length; i++) {
            html.push("<span class='tag tag-" + tags[i].Size + "' data-tag='" + safe(tags[i].Name) + "'>" + safe(tags[i].Name) + "</span> ");
        }

        return html.join('');
    };

    var sortItems = function (items, sort) {
        var i, bags = {};
        if (sort === "date") {
            for (i = 0; i < items.length; i++) {
                if (typeof items[i].Year !== "undefined") {
                    if (typeof bags[items[i].Year] === "undefined") {
                        bags[items[i].Year] = [];
                    }

                    bags[items[i].Year].push(items[i]);
                }
            }
        } else {
            bags[null] = [];
            for (i = 0; i < items.length; i++) {
                bags[null].push(items[i]);
            }
        }

        var result = [];
        for (var j in bags) {
            if (bags.hasOwnProperty(j)) {
                bags[j].sort(function (a, b) {
                    if (a.Title < b.Title) return -1;
                    if (a.Title > b.Title) return 1;
                    return 0;
                });
                result.push({ Year: j, Items: bags[j] });
            }
        }

        result.sort(function (a, b) {
            return b.Year - a.Year;
        });

        return result;
    };

    var getTagItems = function (items, tag) {

        var result = [];

        for (var i = 0; i < items.length; i++) {
            for (var j = 0; j < items[i].Tags.length; j++) {
                if (items[i].Tags[j] === tag) {
                    result.push(items[i]);
                    break;
                }
            }
        }

        return result;
    };

    var getAllTags = function() {
        var tags = {};
        var i,k;

        for (i = 0; i < db.length; i++) {
            if (!!db[i].Tags) {
                for (var j = 0; j < db[i].Tags.length; j++) {
                    var tag = db[i].Tags[j];
                    if (typeof tags[tag] === "undefined") {
                        tags[tag] = { Name: tag, Size: 1, Count: 0 };
                    }
                    tags[tag].Count++;
                }
            }
        }

        var result = [];
        for (k in tags) {
            if (tags.hasOwnProperty(k)) {
                result.push(tags[k]);
            }
        }

        result.sort(function(a, b) {
            if (a.Count < b.Count) return -1;
            if (a.Count > b.Count) return 1;
            return 0;
        });

        var count = 5;

        for (i = 0; i < result.length; i++) {
            result[i].Size = (1 + i * count / result.length) | 0;
        }

        result.sort(function(a, b) {
            if (a.Name < b.Name) return -1;
            if (a.Name > b.Name) return 1;
            return 0;
        });

        return result;
    };

    var selectedTab = "all";
    var selectedSort = "date";
    var selectedTag = null;

    var updateMenu = function () {
        var html = "";
        if (selectedTab === "all") {

            html = printItemList(sortItems(db, selectedSort));
        } else if (selectedTab === "tag" && selectedTag === null) {
            html = printTagList(getAllTags());
        } else if (selectedTab === "tag" && selectedTag !== null) {
            html = printItemList(sortItems(getTagItems(db, selectedTag), selectedSort));
        }

        setMenuContent(html);
    };

    updateMenu();

    $("#cmd-menu-toggle").on("click",
        function() {
            $("main").toggleClass("open");
        });

    $(".tab").on("click",
        function() {
            selectedTab = $(this).data("tab");
            if (selectedTab === "tag") {
                selectedTag = null;
            }

            updateMenu();
        });

    $(".sort").on("click",
        function() {
            selectedSort = $(this).data("sort");
            updateMenu();
        });

    $("#tab-content").on("click",
        ".tag",
        function() {
            //alert($(this).text());
            selectedTag = $(this).data("tag");
            updateMenu();
        });
});