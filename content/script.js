(function(window) {
// evaluate embedded SQL scripts to data tables
// in a specific slide

function evalSQLScript(db, $script, $out) {
        var sql = $script.text();
        if(sql) sql = sql.trim();
        else return;

        var verbose = $script.attr('verbose');

        executeSQL(db, sql, $out.empty(), verbose);
}

function evalSQLScripts($slide, options) {
    options = $.extend({}, options);
    var $scripts = $("script[type=sql]", $slide);
    var dbname = options.dbname || "db";

    // create the output divs for the first invocation
    if(! options.waiting) {
        $scripts.each(function() {
            var $script = $(this);
            $out = $("<div>").text(
                "Waiting for database \"" + dbname + "\" to load...");
            $script.after($out);
        });
    }

    // wait for database to load
    var db = window[dbname];
    if(db) {
        console.debug("DB is loaded");
        $scripts.each(function() {
            var $script = $(this);
            evalSQLScript(db, $script,  $script.next());
        });
    } else {
        setTimeout(function() {
            evalSQLScripts($slide, $.extend(options, {waiting: true}));
        }, 1000);
    }
}

//
// executes a SQL against a database
//
function executeSQL(db, sql, out, verbose) {
    out.empty();
    if(verbose) {
        out.append($("<pre>").text(sql))
    }
    try {
        var results = db.exec(sql);
        window.results = results;
        if($.isArray(results)) {
            for(var i in results) {
                var result = results[i];
                renderTable(out, result);
            }
        }
        else if($.isPlainObject(results)) {
            renderTable(out, results);
        } else {
            console.debug(results);
        }
    } catch(e) {
        out.append($("<pre>")
                .addClass("err")
                .text(e.message));
    }
}

function renderTable(out, result) {
    var table = $("<table>").addClass("sql-result");

    // create the table header
    var thead = $("<thead>");
    var row = $("<tr>");
    result.columns.forEach(function(name, i) {
        row.append($("<td>").text(name));
    });
    thead.append(row);
    table.append(thead);

    // create the table body
    var tbody = $("<tbody>");
    result.values.forEach(function(tuple, i) {
        var row = $("<tr>");
        tuple.forEach(function(val, j) {
            row.append($("<td>").text(val));
        });
        tbody.append(row);
    });
    table.append(tbody);

    out.append(table);
}

// load the database from an existing sqlite3 file

function asyncLoadDb(url) {
    var deferred = $.Deferred();
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';

    xhr.onload = function(e) {
        var array = new Uint8Array(this.response);
        var db = new SQL.Database(array);
        deferred.resolve(db);
    };
    xhr.send();

    return deferred;
}

window.executeSQL = executeSQL;
window.asyncLoadDb = asyncLoadDb;
window.evalSQLScripts = evalSQLScripts;

})(window);
