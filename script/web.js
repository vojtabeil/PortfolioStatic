$(function () {
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
        if (hash != null && hash.substr(0, 1) === "#") {
            var item = find(hash.substr(1));

            if (item === null) {
                $("article").text("Not found");
                return;
            }

            $("#title").text(item.Title);

            if (item.Html != null) {
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

    var itemList = function (db) {
        var html = [];

        for (var i = 0; i < db.length; i++) {
            html.push("<div class='list'>");
            if (db[i].Year != null) {
                html.push("<div>" + db[i].Year + "</div>");
            }

            for (var j = 0; j < db[i].Items.length; j++) {
                var item = db[i].Items[j];

                html.push("<a href='#" + item.Id + "' class='item'>" + safe(item.Title) + "</a>");
            }

            html.push("</div>");
        }

        return html.join('');
    };

    var sortItems = function (items, selectedSort) {
        var i;
        var bags = {};
        if (selectedSort === "date") {
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

    var getAllItems = function () {
        return db;
    };

    var getTagItems = function() {

    };

    var getAllTags = function() {
        
    };

    var selectedTab = "all";
    var selectedSort = "date";
    var selectedTag = null;

    var updateMenu = function () {
        var html = "";
        if (selectedTab === "all") {

            var items = db;

            html = itemList(result);
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
            updateMenu();
        });

    $(".sort").on("click",
        function() {
            selectedSort = $(this).data("sort");
            updateMenu();
        });
});