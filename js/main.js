/* Begin main function */

// (function() {

var fieldsPath = "json/fields.json";
var dataPath = "json/newdata.json";

var fields, data, svg, $slider;
var filter = {};
var colors = d3.scale.category20();
var debug = true;
var visWrapper = d3.select(".visWrapper");

/* Load the data fields. This function kicks off everything else. */
loadFields();

/* End main function */

/* Begin field functions */

function loadFields() {
    d3.json(fieldsPath, function(error, json) {
        if (error) return console.warn(error);
        fields = json;
        initFields();
    });
}

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
    /* Somewhat lamely, we're going to wait to load data until after setting up all the fields. */
    loadData();
}

function initYearSliderControl(header, controls, values) {
    // Initialize a slider with jQuery.
    var slider = controls.append("input");
    $slider = $(slider[0][0]);
    var min = parseInt( Object.keys(values[0])[0] );
    var max = parseInt( Object.keys(values[values.length - 1])[0] );
    $slider.slider({
        min: min,
        max: max,
        value: [min, max],
        tooltip: "always"
    })
    // Event handling
    $slider.on("slide", updateFiltersForYearSlider);
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
            .attr("data-background-color", function(d,i) {
                if (header == "activity") return colors(i);
            })
            .style("background-color", function(d,i) {
                if (header == "activity") return colors(i);
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

    if (header == "activity") {
        controls.selectAll("label")
            .on("mouseenter", function(d, i) {
                var fieldName = d3.select(this).attr("data-field-name");
                d3.selectAll("*[data-field-header='activity'][data-field-name='" + fieldName + "']")
                    .attr("fill", "#ffff00")
                    .style("background-color", "#ffff00")
                ;
            })
            .on("mouseleave", function(d, i) {
                var fieldName = d3.select(this).attr("data-field-name");
                d3.selectAll("*[data-field-header='activity'][data-field-name='" + fieldName + "']")
                    .attr("fill", function() {
                        return d3.select(this).attr("data-fill");
                    })
                    .style("background-color", function() {
                        return d3.select(this).attr("data-background-color");
                    })
                ;
            })
        ;
    }
}

function updateFiltersForYearSlider() {
    var value = $(this).slider('getValue');
    filter["year"] = Array.range(value[0], value[value.length - 1]);
    if (debug) console.log("New year range: " + value);
    initData();
}

function updateFiltersForFieldControls(d, i) {
    // Is this index currently included?
    var header = d3.select(this).attr("data-field-header");
    var name = d3.select(this).attr("data-field-name");
    var indexOfField = filter[header].indexOf(i);
    var that = d3.select(this);
    // Enable this field
    if (that.select("input").attr("type") == "checkbox") {
        if (indexOfField == -1) {
            filter[header].push(i);
            if (debug) console.log("Enabled " + header + " --> " + name);
            that.style("background-color", colors(i));
        } else {
            filter[header].remove(indexOfField, indexOfField);
            if (debug) console.log("Disabled " + header + " --> " + name);
            that.style("background-color", null);
        }
    } else {
        if (indexOfField == -1) {
            filter[header] = [i];
            if (debug) console.log("Switched to " + header + " --> " + name);
        } else {
            if (debug) console.log(header + " --> " + name + " already enabled.");
        }
    }
    initData();
};

/* End field functions */

/* Begin data functions */

function loadData() {
    d3.json(dataPath, function(error, json) {
        if (error) return console.warn(error);
        data = json;
        initData();
    });
}

function initData() {
    /* By now we should have the fields and filter all set up and ready to go. */
    visWrapper.select("svg").remove();
    // Initialize the svg container.
    svg = visWrapper.append("svg")
        .attr("width", visWrapper.style("width"))
        .attr("height", visWrapper.style("height"))
    ;
    // Draw pies.
    drawPies();
}

function getKeysForPies() {
    var keys = [];

    for (var i = 0; i < filter["year"].length; i++) {
        var yearStr = filter["year"][i].toString();
        if (data.hasOwnProperty(yearStr)) {
            keys.push(yearStr);
        }
    }

    return keys;
}

function drawPies() {
    // Adapted from http://bl.ocks.org/mbostock/1346410
    // Clear the contents of the svg.
    var pieKeys = getKeysForPies();
    var numPies = pieKeys.length;
    var rowLimit = 5;
    var numRows = Math.floor(numPies / (rowLimit + 1)) + 1;

    var width = parseInt( visWrapper.style("width") ) / numPies;
    var height = parseInt( visWrapper.style("height") );
    if (numPies > rowLimit) {
        width = parseInt( visWrapper.style("width") ) / rowLimit;
        height = parseInt( visWrapper.style("height") ) / numRows;
    }
    var radius = Math.min(width, height) / 2;

    var pie = d3.layout.pie()
        .value(function(d, i) {
            if (filter["activity"].indexOf(i) > -1) {
                return d[filter["gender"][0]][filter["timeofweek"][0]];
            } else {
                return 0; 
            }
        })
        .sort(null);

    var outerRadiusBase = 40;
    var outerRadius = radius - outerRadiusBase * radius / parseInt( visWrapper.style("width") );
    var innerRadius = radius * 2/5;

    var arc = d3.svg.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);

    var piePaths = [];

    for (var i = 0; i < pieKeys.length; i++) {
        var pieKey = pieKeys[i];
        var datum = data[pieKey];
        var translateX = ( radius * 2 * (i % rowLimit + 0.5) );
        var year = parseInt(pieKey);

        if (numPies == 1) {
            translateX += parseInt( visWrapper.style("height") ) / 2 - outerRadiusBase;
        }
        var translateY = parseInt( visWrapper.style("height") ) / (numRows * 2) * Math.floor(i / rowLimit + 1) + (radius * Math.floor(i / rowLimit));

        var path = svg
            .append("g")
                .attr("transform", "translate(" + translateX + "," + translateY + ")")
        ;
        // Add a text label
        var text = path
            .append("text")
            .attr("text-anchor", "middle")
            .text(year)
            .attr("transform", "translate(0,6) scale(1.5)")
        ;

        var pieGroup = path
            .datum(datum).selectAll("path")
            .data(pie)
            .enter()
                .append("g")
                    .attr("class", "slice")
                .on("mouseenter", function(d, i) {
                    var fieldName = Object.keys(fields["activity"][i])[0];
                    d3.selectAll("*[data-field-header='activity'][data-field-name='" + fieldName + "']")
                        .attr("fill", "#ffff00")
                        .style("background-color", "#ffff00")
                    ;
                })
                .on("mouseleave", function(d, i) {
                    var fieldName = Object.keys(fields["activity"][i])[0];
                    d3.selectAll("*[data-field-header='activity'][data-field-name='" + fieldName + "']")
                        .attr("fill", function() {
                            return d3.select(this).attr("data-fill");
                        })
                        .style("background-color", function() {
                            return d3.select(this).attr("data-background-color");
                        })
                    ;
                })
        ;

        pieGroup.append("path")
            .attr("fill", function(d, i) { return colors(i); })
            .attr("data-fill", function(d, i) { return colors(i); })
            .attr("d", arc)
            .attr("data-year", year)
            .attr("data-field-header", "activity")
            .attr("data-field-name", function(d, i) {
                return Object.keys(fields["activity"][i])[0];
            })
            .each(function(d) {
                this._current = d;
            }) // store the initial angles
        ;

        var textLabelScale = 1.0;
        if (numPies > 3) {
            textLabelScale = 0.75;
        }

        // Adapted from https://gist.github.com/enjalot/1203641
        var textLabel = pieGroup.append("text").attr("transform", function(d) {
            d.innerRadius = 0;
            d.outerRadius = outerRadius;
            return "translate(" + arc.centroid(d) + ") scale(" + textLabelScale + ")";
        })
        .attr("text-anchor", "middle")
        .text(function(d, i) { return d.value; });

        var titleLabel = pieGroup.append("title")
            .text(function(d, i) { return Object.keys(fields["activity"][i])[0] + ": " + d.value + " hours"; });
    }
}
