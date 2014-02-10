// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};

// http://stackoverflow.com/a/3895521
Array.range = function(start, end, step) {
    var range = [];
    var typeofStart = typeof start;
    var typeofEnd = typeof end;

    if (step === 0) {
        throw TypeError("Step cannot be zero.");
    }

    if (typeofStart == "undefined" || typeofEnd == "undefined") {
        throw TypeError("Must pass start and end arguments.");
    } else if (typeofStart != typeofEnd) {
        throw TypeError("Start and end arguments must be of same type.");
    }

    typeof step == "undefined" && (step = 1);

    if (end < start) {
        step = -step;
    }

    if (typeofStart == "number") {

        while (step > 0 ? end >= start : end <= start) {
            range.push(start);
            start += step;
        }

    } else if (typeofStart == "string") {

        if (start.length != 1 || end.length != 1) {
            throw TypeError("Only strings with one character are supported.");
        }

        start = start.charCodeAt(0);
        end = end.charCodeAt(0);

        while (step > 0 ? end >= start : end <= start) {
            range.push(String.fromCharCode(start));
            start += step;
        }

    } else {
        throw TypeError("Only string and number types are supported");
    }

    return range;

}

// (function() {

    /* Load Field Names and Data */
var fields, data;
var filter = {};
var colors = d3.scale.category20();
var debug = true;

d3.json("json/fields.json", function(error, json) {
    if (error) return console.warn(error);
    fields = json;
    initFields();
});

// }());

function initFields() {
    // Initialize controls for each field
    for (header in fields["headers"]) {
        var values = fields[header];
        var controls = d3.select(".controls-" + header);
        var btnClasses = "btn btn-default";
        var inputType = "radio";

        /* Activities buttons get different button appearance and behavior. */
        if (header == "activity") {
            btnClasses = "btn btn-xs btn-default";
            inputType = "checkbox";
        }

        if (header == "year") {
            initYearSliderControl(header, controls, values);
        } else {
            initFieldControls(header, controls, values, btnClasses, inputType);
        }
    }
}

function initYearSliderControl(header, controls, values) {
    // Initialize a slider with jQuery.
    var slider = controls.append("input");
    var min = parseInt( Object.keys(values[0])[0] );
    var max = parseInt( Object.keys(values[values.length - 1])[0] );
    $(slider[0][0]).slider({
        min: min,
        max: max,
        value: [min, max],
        tooltip: "always"
    })
    // Event handling
    $(slider[0][0]).on("slide", updateFiltersForYearSlider);
    // Filter setup
    filter["year"] = Array.range(min, max);
}

function initFieldControls(header, controls, values, btnClasses, inputType) {
    controls.selectAll("label")
        .data(values)
        .enter()
            .append("label")
            .attr("class", function(d, i) {
                if ( inputType == "checkbox" || (inputType == "radio" && i == 0) ) {
                    // Initialize Filters for this Header
                    if (! filter.hasOwnProperty(header)) {
                        filter[header] = [];
                    }
                    // Update Filter for this Header
                    filter[header].push(i);
                    return btnClasses + " active";
                } else {
                    return btnClasses;
                }
            })
            .attr("data-field-header", header)
            .attr("data-field-name", function(d) {
                return Object.keys(d)[0];
            })
            .text(function(d) {
                return d[Object.keys(d)[0]];
            })
            .on("click", updateFiltersForFieldControls)
            .append("input")
                .attr("type", inputType)
    ;
}

function updateFiltersForYearSlider() {
    var value = $(this).slider('getValue');
    filter["year"] = Array.range(value[0], value[value.length - 1]);
    if (debug) console.log("New year range: " + value);
}

function updateFiltersForFieldControls(d, i) {
    // Is this index currently included?
    var header = d3.select(this).attr("data-field-header");
    var name = d3.select(this).attr("data-field-name");
    var indexOfField = filter[header].indexOf(i);
    // Enable this field
    if (d3.select(this).select("input").attr("type") == "checkbox") {
        if (indexOfField == -1) {
            filter[header].push(i);
            if (debug) console.log("Enabled " + header + " --> " + name);
        } else {
            filter[header].remove(indexOfField, indexOfField);
            if (debug) console.log("Disabled " + header + " --> " + name);
        }
    } else {
        if (indexOfField == -1) {
            filter[header] = [i];
            if (debug) console.log("Switched to " + header + " --> " + name);
        } else {
            if (debug) console.log(header + " --> " + name + " already enabled.");
        }
    }
};
