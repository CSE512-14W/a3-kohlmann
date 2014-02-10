// (function() {

    /* Load Field Names and Data */
    var fields, data, filter;
    var colors = d3.scale.category20();

    d3.json("json/fields.json", function(error, json) {
        if (error) return console.warn(error);
        fields = json;
        initFields();
    });

    var initFields = function() {
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
                initYearSliderControl(controls, values);
            } else {
                initFieldControls(controls, values, btnClasses, inputType);
            }
        }
    };

    var initYearSliderControl = function(controls, values) {
        // Initialize a slider with jQuery.
        var slider = controls.append("input");
        var min = parseInt( Object.keys(values[0])[0] );
        var max = parseInt( Object.keys(values[values.length - 1])[0] );
        $(slider[0][0]).slider({
            min: min,
            max: max,
            value: [min, max],
            tooltip: "always"
        });
    }

    var initFieldControls = function(controls, values, btnClasses, inputType) {
        controls.selectAll("label")
            .data(values)
            .enter()
                .append("label")
                .attr("class", function(d, i) {
                    if ( inputType == "checkbox" || (inputType == "radio" && i == 0) ) {
                        return btnClasses + " active";
                    } else {
                        return btnClasses;
                    }
                })
                .text(function(d) {
                    return d[Object.keys(d)[0]];
                })
                .on("click", updateFilters)
                .append("input")
                    .attr("type", inputType)
        ;
    }

    var updateFilters = function() {
        console.log("Updating filters...");
    };

// }());
