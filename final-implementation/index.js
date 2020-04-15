//the fields communities, stations, crimes, and communitiesNearStations are all imported in index.html
//This site was used as reference: http://bl.ocks.org/almccon/a53831a573911d0a875821c5f9fac6be

const createVisualization = () => {
    const width = 950, height = 1100;
    var selectedCommunity = "VARSITY";
    var yearFilter = "2012";

    //this projection scales geographic coordinates to the appropriate screen size
    var projection = d3.geoMercator()
        .center([-114.0719, 51.0447])
        .scale(100000)
        .translate([width/2, height/2 - 50]);

    var path = d3.geoPath()
        .projection(projection);

    //These are all crimes in 2019
    const crimeData2019 = crimes.filter((crime) => {
       return crime["Year"] === yearFilter;
    });

    const stationCrimes = crimes.filter((crime) => {
        return communitiesNearStations.includes(crime["Community Name"]);
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

    const crimeDomain = [30, 50, 70, 90, 110, 130];
    const colours = ["#ffe6e6", "#ffcccc", "#ff9999", "#ff4d4d", "#ff0000", "#b30000"];

    //Create the scale functions for colour of community depending on crime count in domain
    const colourScale = d3.scaleThreshold()
        .domain(crimeDomain)
        .range(colours);

    var svg = d3.select(".map").append("svg")
        .attr("width", width)
        .attr("height", height);

    //Create crime information card
    const infoCard = d3.select(".legend").append("svg")
        .attr("width", "300px")
        .attr("height", "200px");

    //a function used to create and update the information card
    function createInfo() {
        infoCard.append("rect")
            .attr("class", "crime-card")
            .attr("width", "300px")
            .attr("height", "200px")
            .attr("stroke", "white")
            .attr("fill", "white");

        infoCard.append("text")
            .text(`${selectedCommunity}`)
            .attr("font-size", (d) => {
                //makes it so text will fit in box
                if (selectedCommunity.length <= 16){
                    return 35;
                } else if ( selectedCommunity.length < 21){
                    return 24;
                } else {
                    return 18;
                }
            })
            .attr("transform", "translate(0, 36)");

        infoCard.append("text")
            .text(`Community Name: ${selectedCommunity}`)
            .attr("font-size", "14")
            .attr("transform", "translate(4, 72)");

        infoCard.append("text")
            .text(`Crime Count: ${getTotalCrimeCounts()[selectedCommunity]}`)
            .attr("font-size", "14")
            .attr("transform", "translate(4, 86)");

        svg.append("line")
            .attr("x1", "1000.125")
            .attr("y1", "266.625")
            .attr("x2", "1200")
            .attr("y2", "200")
            .attr("stroke", "black");
    }

    const drawMap = () => {
        const newCrimeCounts = getTotalCrimeCounts();
        //Create Calgary map with community borders
        svg.selectAll("path")
            .data(communities.features)
            .enter().append("path")
            .attr('class', (d) => {return "community-" + d.properties['name'].split(/[\s /]/).join("")})
            .attr("d", path)
            .attr("fill", (d) => {
                const communityName = d.properties["name"];
                //Colour the station communities the appropriate saturation of red, white if not station community
                return communitiesNearStations.includes(communityName) ? colourScale(newCrimeCounts[communityName]) : "#ffffff";
            })
            .attr("stroke", (d) => {
                return d.properties["name"] === selectedCommunity ? "aqua" : "black";
            })
            .attr("stroke-width", (d) => {
                return d.properties["name"] === selectedCommunity ? "4" : "0.5";
            })
            .on('click', (d) => {
                d3.select(".community-" + d.properties['name'].split(/[\s /]/).join("")).attr('fill','orange');
                selectedCommunity = d.properties['name'];
                if (getTotalCrimeCounts()[selectedCommunity] != undefined){
                    createInfo();
                }
                console.log("community-" + d.properties['name']);
                console.log(getTotalCrimeCounts()[selectedCommunity])
            })
            .on("mouseover", (d) => {
                d3.select(".community-" + d.properties['name'].split(/[\s /]/).join("")).attr('fill','blue');
            })
            .on("mouseout", (d) => {
                const communityName = d.properties["name"];
                //Colour the station communities the appropriate saturation of red, white if not station community
                d3.select(".community-" + d.properties['name'].split(/[\s /]/).join("")).attr('fill', communitiesNearStations.includes(communityName) ? colourScale(newCrimeCounts[communityName]) : "#ffffff");
            });

        //Plot stations
        const station = svg.selectAll("g")
            .data(stations).enter()
            .append("g")
            .attr("transform", (d) => {
                return `translate(${projection([d.coordinates[1], d.coordinates[0]])[0]}, ${projection([d.coordinates[1], d.coordinates[0]])[1]})`
            });

        station.append("circle")
            .attr("r", "3.5px")
            .attr("fill", "blue");

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
                return communitiesNearStations.includes(communityName) ? colourScale(newCrimeCounts[communityName]) : "#ffffff";
            })
            .attr("stroke", (d) => {
                return d.properties["name"] === selectedCommunity ? "aqua" : "black";
            })
            .attr("stroke-width", (d) => {
                return d.properties["name"] === selectedCommunity ? "4" : "0.5";
            });

        //Plot stations
        const station = svg.selectAll("g")
            .data(stations).enter()
            .append("g")
            .attr("transform", (d) => {
                return `translate(${projection([d.coordinates[1], d.coordinates[0]])[0]}, ${projection([d.coordinates[1], d.coordinates[0]])[1]})`
            });

        station.append("circle")
            .attr("r", "3.5px")
            .attr("fill", "blue");
    };

    drawMap();

    //Create Legend
    d3.select(".legend").append("h3").text("Crime Count Legend");
    d3.select(".legend").append("svg")
        .attr("class", "legend-box")
        .append("g")
        .attr("class", "legend-quant");

    var legend = d3.legendColor()
        .labelFormat(d3.format(".0f"))
        .labels(d3.legendHelpers.thresholdLabels)
        .scale(colourScale)
        .shapePadding(5)
        .shapeWidth(18)
        .shapeHeight(18)
        .labelOffset(12);

    var legendBox = d3.select(".legend-box");

    legendBox.select(".legend-quant")
        .call(legend);

    //hard coded year
    var yrData = [2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019];
    var yearSlider = d3.sliderBottom()
        .min(d3.min(yrData))
        .max(d3.max(yrData))
        .width(350)
        .ticks(8,"s")
        // .tickFormat(d3.format("4s"))
        .step(1)
        .default(yearFilter)
        .on('onchange', d => {
            yearFilter = yearSlider.value().toString();
            updateMap();
            if(getTotalCrimeCounts()[selectedCommunity] != undefined){
                createInfo();
            }
        });

    var sliderChange = d3.selectAll('div#slider-step')
        .append('svg')
        .attr('width', 500)
        .attr('height', 100)
        .append('g')
        .attr('transform', 'translate(30,30)');

    sliderChange.call(yearSlider);
};
