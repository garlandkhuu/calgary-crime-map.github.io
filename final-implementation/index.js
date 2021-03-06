//the fields communities, stations, crimes, and includedCommunities are all imported in index.html
//This site was used as reference: http://bl.ocks.org/almccon/a53831a573911d0a875821c5f9fac6be

const createVisualization = () => {
    const allCommunities = communities.features.map((community) => {
        return community.properties.name;
    });
    const width = 980, height = 1300;
    const originalWindowHeight = window.innerHeight;
    var selectedCommunity = "DOWNTOWN COMMERCIAL CORE";
    var yearFilter = "2012";
    var includedCommunities = allCommunities;
    var mapToggle = false;
    const crimeTypes = ["Assault (Non-domestic)", "Commercial Break & Enter", "Physical Disorder", "Residential Break & Enter", "Social Disorder", "Theft FROM Vehicle", "Street Robbery", "Theft OF Vehicle", "Violence Other (Non-domestic)"];
    const crimeClassMap = {
        "Assault (Non-domestic)": 'assault-nd',
        "Commercial Break & Enter": 'comm-break-enter',
        "Physical Disorder": 'physical-disord',
        "Residential Break & Enter": 'res-break-enter',
        "Social Disorder": "social-disord",
        "Theft FROM Vehicle": "theft-frm-vehicle",
        "Street Robbery": "street-robb",
        "Theft OF Vehicle": "theft-of-vehicle",
        "Violence Other (Non-domestic)": "violence-other-nd"
    }

    //These are all crimes in 2019
    const crimeData2019 = crimes.filter((crime) => {
       return crime["Year"] === yearFilter;
    });

    const stationCrimes = crimes.filter((crime) => {
        return includedCommunities.includes(crime["Community Name"]);
    });

    //generates crime data for the selected year
    const getStationCrimesForYear = () => {
        return stationCrimes.filter((crime) => {
            return crime["Year"] === yearFilter;
        });
    };

    //get aggregated data for total crimes
    const getTotalCrimeCounts = () => {
        var totalCrimes = {};
        getStationCrimesForYear().forEach((crime) => {
            const communityName = crime["Community Name"];
            //If there is an entry in the totalCrimes map for that specific community, increment the count, else, initialize to 1.
            totalCrimes[communityName] = totalCrimes[communityName] ? totalCrimes[communityName] + 1 : 1;
        });
        return totalCrimes;
    };

    //get data for specified crimes in specified areas
    const getCrimeType = () => {
        var crimeComType = {};

        //make an empty object for each community
        getStationCrimesForYear().forEach((crime) => {
            const communityName = crime["Community Name"];
            crimeComType[communityName] = {};
        });

        //Populate each community with its different crimes
        getStationCrimesForYear().forEach((crime) => {
            const communityName = crime["Community Name"];
            const crimeType = crime["Category"];
            //If there is an entry in the crimeComType map for that specific community, increment the count, else, initialize to 1.
            crimeComType[communityName][crimeType] = crimeComType[communityName][crimeType] ? crimeComType[communityName][crimeType] + 1 : 1;
        });
        return crimeComType;
    };

    var crimeTypeMap = getCrimeType();

    const isCrimeCountValid = (crimeType) => {
        if(crimeTypeMap[selectedCommunity]){
            if(crimeTypeMap[selectedCommunity][crimeType])
                return true;
            return false;
        }
        return false
    };

    const crimeDomain = [30, 45, 60, 75, 90, 105, 120];
    const colours = ["#fce1a4", "#fabf7b", "#f08f6e", "#e05c5c", "#d12959", "#ab1866", "#6e005f"];

    //Create the scale functions for colour of community depending on crime count in domain
    const colourScale = d3.scaleThreshold()
        .domain(crimeDomain)
        .range(colours);

    var svg = d3.select(".map").select(".map-wrapper").append("svg")
        .attr("width", width)
        .attr("height", height);

    //Create crime information card
    const infoCard = d3.select(".info-wrapper").append("svg")
        .attr("class", "info-card")
        .attr("width", "500px")
        .attr("height", "500px");
    
    var xScale = d3.scaleBand().range([0, 400]).domain(crimeTypes).padding(0.4),
        yScale = d3.scaleLinear().range([400, 100]).domain([0, 18]);

    //a function used to create and update the information card
    const createInfo = () => {
        infoCard.append("rect")
            .attr("class", "crime-card")
            .attr("width", '500px')
            .attr("height", "500px")
            .attr("stroke", "white")
            .attr("fill", "black");

        infoCard.append("text")
            .attr("class", "card-title")
            .text(`${selectedCommunity} (${yearFilter})`)
            .attr("font-size", "16px")
            .attr("x", "50%")
            .attr("y", "6%")
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle");

        infoCard.append("text")
            .attr("class", "card-subtitle")
            .text("Total Crime Count: " + (getTotalCrimeCounts()[selectedCommunity] ? getTotalCrimeCounts()[selectedCommunity] : "No Value"))
            .attr("font-size", "14px")
            .attr("x", "50%")
            .attr("y", "10%")
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle");

        infoCard.append("g")
            .attr("transform", "translate(70, 360)")
            .attr("class", "x-scale")
            .call(d3.axisBottom(xScale))
            .selectAll("text")
              .attr("transform", "translate(-10,0)rotate(-45)")
              .style("text-anchor", "end")
              .style("stroke-width", "0px")
              .style("font-size", "12px");

        infoCard.append("g")
            .call(d3.axisLeft(yScale))
            .attr("transform", "translate(70, -40)")
            .attr("stroke", "white");

        infoCard.selectAll("bar")
            .data(crimeTypes)
            .enter().append("rect")
            .attr("class", function(d) { return `bar-${crimeClassMap[d]}` })
            .style("fill", "#ab1866")
            .attr("x", function(d) { return xScale(d) + 70; })
            .attr("width", "20px")
            .attr("y", function(d) { return isCrimeCountValid(d) ? yScale(crimeTypeMap[selectedCommunity][d]) - 40 : 360; })
            .attr("height", function(d) { return isCrimeCountValid(d) ? 400 - yScale(crimeTypeMap[selectedCommunity][d]) : 0; })

        infoCard.selectAll("text")
            .attr("fill", "white");
    };

    const updateInfo = () => {
        infoCard.select(".card-title")
            .text(`${selectedCommunity} (${yearFilter})`)

        infoCard.select(".card-subtitle")
            .text("Total Crime Count: " + (getTotalCrimeCounts()[selectedCommunity] ? getTotalCrimeCounts()[selectedCommunity] : "No Value"));

        for(var i = 0; i < crimeTypes.length; i++) {
            const d = crimeTypes[i];
            infoCard.select(`.bar-${crimeClassMap[d]}`)
                .transition()
                .duration(500)
                .attr("x", xScale(d) + 70)
                .attr("width", "20px")
                .attr("y", isCrimeCountValid(d) ? yScale(crimeTypeMap[selectedCommunity][d]) - 40 : 360)
                .attr("height",  isCrimeCountValid(d) ? 400 - yScale(crimeTypeMap[selectedCommunity][d]) : 0);
        }
    };

    const drawMap = () => {
        //this projection scales geographic coordinates to the appropriate screen size
        var projection = d3.geoMercator()
            .center([-114.0719, 51.0447])
            .scale(window.screen.height*80)
            .translate([width/2, height/2 - 50]);

        var path = d3.geoPath()
            .projection(projection);

        const newCrimeCounts = getTotalCrimeCounts();
        //Create Calgary map with community borders
        svg.selectAll("path")
            .data(communities.features)
            .enter().append("path")
            .attr("class", (d) => {return "community-" + d.properties["name"].split(/[\s /]/).join("")})
            .attr("d", path)
            .attr("fill", (d) => {
                const communityName = d.properties["name"];
                //Colour the station communities the appropriate saturation of red, white if not station community
                return includedCommunities.includes(communityName) ? colourScale(newCrimeCounts[communityName]) : "black";
            })
            .attr("stroke", (d) => {
                return d.properties["name"] === selectedCommunity ? "#00ffd1" : "white";
            })
            .attr("stroke-width", (d) => {
                return d.properties["name"] === selectedCommunity ? "4" : "0.5";
            })
            .attr("stroke-opacity", 1)
            .on("click", (d) => {
                if(!(d.properties["name"] === selectedCommunity) && includedCommunities.includes(d.properties["name"])){
                    d3.select(".community-" + d.properties["name"].split(/[\s /]/).join(""))
                        .attr("fill","#00ffd1");
                    selectedCommunity = d.properties["name"];
                    updateInfo();
                    updateMap();
                }
            })
            .on("mouseover", (d) => {
                //Turn stroke to transparent #00ffd1 went mouse over except for the selected community
                if (!(d.properties["name"] === selectedCommunity) && includedCommunities.includes(d.properties["name"])){
                    d3.select(".community-" + d.properties["name"].split(/[\s /]/).join(""))
                        .transition()
                        .attr("stroke","#00ffd1")
                        .attr("stroke-width", 4)
                        .attr("stroke-opacity", 0.5);
                }
                //For communities far from stations, turn stroke thicker
                else {
                    d3.select(".community-" + d.properties["name"].split(/[\s /]/).join(""))
                        .attr("stroke-width", 2)
                }
            })
            .on("mouseout", (d) => {
                //revert stroke back to normal after mouse out for non selected communities
                if (!(d.properties["name"] === selectedCommunity)){
                    d3.select(".community-" + d.properties["name"].split(/[\s /]/).join(""))
                        .transition()
                        .attr("stroke","white")
                        .attr("stroke-width", 0.5)
                        .attr("stroke-opacity", 1);
                }
            });

        //Plot stations
        const station = svg.selectAll("g2")
            .data(stations).enter()
            .append("g")
            .attr("class", "station")
            .attr("transform", (d) => {
                return `translate(${projection([d.coordinates[1], d.coordinates[0]])[0]}, ${projection([d.coordinates[1], d.coordinates[0]])[1]})`
            })
            .on("mouseover", (d) => {
                d3.select(".station-" + d["Station Name"].split(/[\s /]/).join("")).transition().style("opacity", 1);
                d3.select(".circle-" + d["Station Name"].split(/[\s /]/).join("")).transition().attr("fill", "#00ffd1");
            })
            .on("mouseout", (d) => {
                d3.select(".station-" + d["Station Name"].split(/[\s /]/).join("")).transition().style("opacity", 0);
                d3.select(".circle-" + d["Station Name"].split(/[\s /]/).join("")).transition().attr("fill", "#03c9ac");
            });

        station.append("circle")
            .attr("r", "3px")
            .attr("fill", "#03c9ac")
            .attr("class", (d)=>{
               return "circle-" + d["Station Name"].split(/[\s /]/).join("");
            });

        const stationName = svg.selectAll("g2")
            .data(stations).enter()
            .append("g")
            .attr("transform", (d) =>{
                return `translate(${projection([d.coordinates[1], d.coordinates[0]])[0]}, ${projection([d.coordinates[1], d.coordinates[0]])[1] - 10})`
            });

        stationName.append("text")
            .attr("fill", "white")
            .attr("class", (d)=>{
                return "station-" + d["Station Name"].split(/[\s /]/).join("");
            })
            .attr("pointer-events", "none")
            .style("opacity", 0)
            .text( (d) =>{
                return d['Station Name'];
            });
        
        //Create Legend
        d3.select(".map").select(".legend-wrapper").append("h3")
            .text("Crime Count Legend")
            .style("font-size", "14px")
            .style("font-family", "arial")
            .style("font-weight", "lighter")
            .attr("class", "legend-heading");
        d3.select(".map").select(".legend-wrapper").append("svg")
            .attr("class", "legend-box")
            .append("g")
            .attr("class", "legend-quant");

        var legend = d3.legendColor()
            .labelFormat(d3.format(".0f"))
            .labels(d3.legendHelpers.thresholdLabels)
            .scale(colourScale)
            .shapePadding(5)
            .shapeWidth(12)
            .shapeHeight(12)
            .labelOffset(12);

        var legendBox = d3.select(".legend-box");

        legendBox
            .attr("height", "130px")
            .attr("width", "130px");

        legendBox.select(".legend-quant")
            .call(legend);

        legendBox.selectAll(".label")
            .attr("fill", "white")

        //Create slider
        //Years from 2012 - 2019 for our slider axis
        var yrData = [2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019];
        var yearSlider = d3.sliderBottom()
            .min(d3.min(yrData))
            .max(d3.max(yrData))
            .width(350)
            .ticks(8,"s")
            .tickFormat(d3.format(".0f"))
            .step(1)
            .tickValues(yrData)
            .default(2012)
            .on("onchange", d => {
                yearFilter = yearSlider.value().toString();
                crimeTypeMap = getCrimeType();
                updateMap();
                updateInfo();

            });

        var sliderChange = d3.selectAll("div#slider-step")
            .append("svg")
            .attr("width", 500)
            .attr("height", 100)
            .append("g")
            .attr("transform", "translate(30,30)");

        sliderChange.call(yearSlider);

        d3.select("#slider-step").select("svg")
            .attr("fill", "white")
            .attr("transform", "translate(-15, 0)");

        d3.select("#slider-step").select(".slider")
            .attr("cursor", "pointer");

        //Add toggle functionality to toggle button
        const toggleButton = d3.select("body").select("#map-toggle");

        toggleButton
            .on("change", () => {
                if(mapToggle) {
                    includedCommunities = allCommunities;
                    mapToggle = !mapToggle;
                    updateMap();
                    updateInfo();
                }
                else {
                    includedCommunities = communitiesNearStations;
                    mapToggle = !mapToggle;
                    updateMap();
                    updateInfo();
                }
            });

        createInfo();
    };

    const updateMap = () => {
        const newCrimeCounts = getTotalCrimeCounts();
        //Create Calgary map with community borders
        svg.selectAll("path")
            .data(communities.features)
            .transition()
            .attr("fill", (d) => {
                const communityName = d.properties["name"];
                //Colour the station communities the appropriate saturation of red, white if not station community
                return includedCommunities.includes(communityName) ? colourScale(newCrimeCounts[communityName]) : "black";
            })
            .attr("stroke", (d) => {
                return d.properties["name"] === selectedCommunity ? "#00ffd1" : "white";
            })
            .attr("stroke-width", (d) => {
                return d.properties["name"] === selectedCommunity ? "4" : "0.5";
            })
            .attr("stroke-opacity", 1);
    };

    drawMap();
};
