const createVisualization = () => {
    var yrData = [2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020];
    var data = [0, 0.005, 0.01, 0.015, 0.02, 0.025];
    var sliderStep = d3.sliderBottom()
        .min(d3.min(yrData))
        .max(d3.max(yrData))
        .width(300)
        .ticks(13)
        .step(1)
        .default(2010)
        .on('onchange', d => {
            d3.selectAll('slider').append('input').enter().text(d)
        });

    var gStep = d3.selectAll('slider-step')
        .append('svg')
        .enter()
        .attr('widt', 500)
        .attr('height', 100)
        .append('g').enter()
        .attr('transform', 'translate(30,30');

    gStep.call(sliderStep);
    d3.select('slider').text((sliderStep.value()));

    var sliderStep2 = d3
        .sliderBottom()
        .min(d3.min(data))
        .max(d3.max(data))
        .width(300)
        .tickFormat(d3.format('.2%'))
        .ticks(5)
        .step(0.005)
        .default(0.015)
        .on('onchange', val => {
            d3.selectAll('value-step').append('p').enter().text(d3.format('.2%')(val));
        });

    var gStep = d3
        .select('slider-step')
        .append('svg').enter()
        .attr('width', 500)
        .attr('height', 100)
        .append('g')
        .attr('transform', 'translate(30,30)');

    gStep.call(sliderStep2);

    d3.select('p#value-step').text(d3.format('.2%')(sliderStep2.value()));
}