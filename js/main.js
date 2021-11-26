        // show baselayer dropdown menu
        function baselayerDropdownFunction() {
          document.getElementById("baselayerDropdownList").classList.toggle("show1");
        }
        window.addEventListener('click', function (event) {
          if (!event.target.matches('#baselayer-btn-dropdown')) {
            const dropdown1 = document.getElementsByClassName("dropdown-content1");
            let i;
            for (i = 0; i < dropdown1.length; i++) {
              const openDropdown1 = dropdown1[i];
              if (openDropdown1.classList.contains('show1')) {
                openDropdown1.classList.remove('show1');
              }
            }
          }
        });

        // basemaps
        const oceanESRI = L.tileLayer(
          'https://server.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri, USGS, NPS, and the GIS User Community' + '<br>' +
              "<span id='appDevBy'>Application developed by: </span><a id='me' href='https://efano.github.io/' target='_blank'>Lis Fano</a>",
          })
        const topoESRI = L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri, USGS, NPS, and the GIS User Community' + '<br>' +
              "<span id='appDevBy'>Application developed by: </span><a id='me' href='https://efano.github.io/' target='_blank'>Lis Fano</a>",
          });
        const imageryESRI = L.tileLayer(
          'https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri, USGS, NPS, and the GIS User Community' + '<br>' +
              "<span id='appDevBy'>Application developed by: </span><a id='me' href='https://efano.github.io/' target='_blank'>Lis Fano</a>",
          });
        const nationalGeo = L.tileLayer(
          'https://server.arcgisonline.com/arcgis/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'National Geographic, Esri, Garmin, HERE, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, increment P Corp.' +
              '<br>' +
              "<span id='appDevBy'>Application developed by: </span><a id='me' href='https://efano.github.io/' target='_blank'>Lis Fano</a>",
          })
        const topoUSGS = L.tileLayer(
          'https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri, USGS, NPS, and the GIS User Community' + '<br>' +
              "<span id='appDevBy'>Application developed by: </span><a id='me' href='https://efano.github.io/' target='_blank'>Lis Fano</a>",
          });

        const options = {
          //center: [58.7, -136.7],
          //zoom: 9,
          maxZoom: 16,
          zoomSnap: .1,
          layers: imageryESRI,
          zoomControl: false,
        };

        const map = L.map('map', options);

        let baseLayers = {
          "<span id='radioText'>USGS Topo</span>": topoUSGS,
          "<span id='radioText'>ESRI Imagery</span>": imageryESRI,
          "<span id='radioText'>ESRI Ocean</span>": oceanESRI,
          "<span id='radioText'>ESRI Topo</span>": topoESRI,
          "<span id='radioText'>National Geographic</span>": nationalGeo,
        };

        // basemap legend
        const control = L.control.layers(baseLayers, null, {
          collapsed: false,
        }).addTo(map);

        // move baselayer control icon to navbar
        let htmlObject = control.getContainer();
        // get the desired parent node
        let newParent = document.getElementById('baselayerDropdown');
        // append the node to the new parent, recursively searching out and re-parenting nodes
        setParent(htmlObject, newParent);

        function setParent(el, newParent) {
          newParent.appendChild(el);
        };

        // reposition zoom control to upper right
        map.addControl(L.control.zoom({
          position: 'topright'
        }));

        // create scalebar
        L.control.scale({
          position: 'bottomright',
          metric: true,
          maxWidth: 120,
        }).addTo(map);

        let selectedRadioValue = "0";
        let ctdfilter3 = [];
        let chartData = [];
        let attribute = "temperature"
        let label = "Temperature (&#8451; )"

        // use D3 fetch to request data with async requests
        const allPoints = d3.json('data/stations.json');

        // use Promise to wait until data is all loaded
        Promise.all([allPoints])
          .then(drawMap);

        function drawMap(data) {

          // pull out separate data arrays and assign to variables
          const ptData = data[0];

          // create a point layer with the geojson data
          const stationPoints = L.geoJson(ptData, {
            pointToLayer: function (feature, latlng) {
              return L.shapeMarker(latlng)
            }
          }).addTo(map);

          // fit map bounds to feature extent
          map.fitBounds(stationPoints.getBounds(), {
            padding: [30, 30]
          });

          drawPts(stationPoints);
          drawChartLegend();

          // draw stations 
          function drawPts(stationPoints) {
            stationPoints.eachLayer(function (layer) {
              let props = layer.feature.properties;
              let type = props.CoreLoc;

              if (type === "y") {
                layer.setStyle({
                  shape: "triangle",
                  color: '#222',
                  fillColor: "#FF00D8",
                  fillOpacity: 1,
                  weight: 1.3,
                  radius: 7,
                })
                layer.bindTooltip(props['Station'], {
                  className: 'stationTooltipCoreY',
                  permanent: true,
                  direction: 'center',
                });
              } else if (type === "n") {
                layer.setStyle({
                  shape: "triangle",
                  color: '#222',
                  fillColor: "#00FCFF",
                  fillOpacity: 1,
                  weight: 1.3,
                  radius: 7,
                })
                layer.bindTooltip(props['Station'], {
                  className: 'stationTooltipCoreN',
                  permanent: true,
                  direction: 'center',
                });
              };

              //when mousing over a station point
              layer.on('mouseover', function () {
                layer.bringToFront();
                layer.setStyle({
                  radius: 16,
                  weight: 2,
                  color: 'yellow',
                });
              });

              layer.on('mouseout', function () {
                layer.setStyle({
                  radius: 7,
                  weight: 1.3,
                  color: '#222',
                });
              });

              layer.on('mousedown', function () {
                let num = layer.feature.properties.Station;
                attribute = "temperature"
                label = "Temperature (&#8451; )"
                selectedRadioValue = "0";
                ctdfilter3.length = 0;
                chartData.length = 0;
                if ($("#pointLegend").is(":visible")) {
                  getChartData(layer);
                  $("#pointLegend").fadeOut("fast");
                  $(".chartLegend").fadeIn(1000);
                } else {
                  getChartData(layer);
                };
                const coords = layer.getLatLng();
                map.setView(coords, 11, {
                  animate: true,
                  duration: 1,
                  easeLinearity: 1
                });
              });
            });
          };

          extentIcon(stationPoints);
          // extent button on click
          function extentIcon(stationPoints) {
            $('#globe-icon').click(function () {
              map.flyToBounds(stationPoints.getBounds(), {
                padding: [50, 50]
              });
            });
          };

          // create legend
          function drawChartLegend() {
            const chartLegend = L.control({
              position: 'topleft'
            });
            chartLegend.onAdd = function (map) {
              div = L.DomUtil.create('div', 'chartLegend');
              return div;
            }
            chartLegend.addTo(map);
            $(".chartLegend").hide();

            L.DomEvent.addListener(div, 'mousewheel', function (e) {
              L.DomEvent.stopPropagation(e);
            });
          };

          // toggle CTD selection dropdown menu
          function changeDropdownUI() {
            $('select[id="dropdown"]').change(function () {
              attribute = this.value;
              label = this.options[this.selectedIndex].title
              drawD3Chart();
              //console.log(attribute)
            });
          };

          function getChartData(layer) {
            let num = layer.feature.properties.Station;

            const chartLegendTitle = "<div class='chartLegendMain'>" +
              "<h4 class='chartLegendTitle'>" +
              "Station " + num + "</h4></div>";
            $(".chartLegend").html(chartLegendTitle);

            const loader2 = "<div>" + "<div class='flex-child loading loading--s' id='loader2'>" +
              "</div></div>"
            $(loader2).insertAfter(".chartLegendMain");

            // add close button
            const closeIcon = $(".legendCloseIcon").html();
            $(closeIcon).insertBefore(".chartLegendMain");
            $(".closeIconDiv").click(function () {
              $('.chartLegend').fadeOut();
              $('.pointLegend').fadeIn(1000);
            });

            // filter initial num station # in csv 
            d3.csv("data/y2019.csv").then(function (data) {
              let ctdfilter1 = data.filter(function (d) {
                return d.station === num
              });

              // get unique number of casts by date to dynamically create the number of radio buttons per station
              let ctdfilter2 = d3.map(ctdfilter1, function (d) {
                return d.date_gmt;
              }).keys()

              chartData.length = 0;
              let ctdfilter3 = ctdfilter1.filter(function (d) {
                return d.cast === selectedRadioValue
              });
              chartData.push(ctdfilter3);

              // dynamically create radio buttons
              let radioHTML = "";
              $.each(ctdfilter2, function (index, value) {
                radioHTML +=
                  '<label class="radio-container"><input type="radio" name="radio-gray" value="' +
                  index + '" id="' + value + '">' +
                  '<div class="radio radio--gray radio--s-label radio--darken75 mr6" id="' +
                  value + '"> ' +
                  '</div>' + '<div class="radioText">' + value +
                  '</div></label>';
              });
              $(radioHTML).insertAfter(".chartLegendMain");

              // select first radio button
              let selected = $("input[name='radio-gray'][value='0']").prop(
                'checked', true);

              // toggle radio buttons
              $("input[name='radio-gray']").change(function () {
                selectedRadioValue = this.value;

                // create new array of filtered data by date with selected radio
                ctdfilter3.length = 0;
                chartData.length = 0;
                ctdfilter3 = ctdfilter1.filter(function (d) {
                  return d.cast === selectedRadioValue
                });
                chartData.push(ctdfilter3);

                // call d3.js chart function
                drawD3Chart();
              });

              const chartMeasurementDateTitle = "<h6 class='chartMeasurementDateTitle'>" +
                "Measurement Dates " + "</h6>";
              $(chartMeasurementDateTitle).insertBefore(
                ".radio-container:first");

              const chartMeasurementTitle =
                "<h6 class='chartMeasurementTitle'>" +
                "CTD Profile Measurements " + "</h6>";
              $(chartMeasurementTitle).insertAfter(
                ".radio-container:last");

              const dropdown = $("#ui-control").html();
              $(dropdown).insertAfter(".chartMeasurementTitle");

              changeDropdownUI();
              drawD3Chart();

              //console.log('attribute: ', attribute);
            });
          };

          function drawD3Chart() {
            $("#loader2").remove();
            $("#wrapper").remove();
            const chart2Canvas = "<div class='wrapper' id='wrapper'>" + "</div>"
            $(chart2Canvas).insertAfter("#dropdown");

            // access data
            const dataset = chartData[0];
            //console.log("DATASET: ", dataset);
            const yAccessor = d => +d.depth * -1;
            const xAccessor = d => +d[attribute];

            // create chart dimensions
            let dimensions = {
              width: 300,
              height: 600,
              margin: {
                top: 15,
                right: 15,
                bottom: 40,
                left: 60,
              },
            }

            dimensions.boundedWidth = dimensions.width -
              dimensions.margin.left -
              dimensions.margin.right
            dimensions.boundedHeight = dimensions.height -
              dimensions.margin.top -
              dimensions.margin.bottom

            // draw canvas
            const wrapper = d3.select("#wrapper")
              .append("svg")
              .attr("width", dimensions.width)
              .attr("height", dimensions.height)

            const bounds = wrapper.append("g")
              .style("transform", `translate(${
                    dimensions.margin.left
                }px, ${
                    dimensions.margin.top
                }px)`)

            // create scales
            const yScale = d3.scaleLinear()
              .domain(d3.extent(dataset, yAccessor))
              .range([dimensions.boundedHeight, 0])
              .nice()

            const xScale = d3.scaleLinear()
              .domain(d3.extent(dataset, xAccessor))
              .range([0, dimensions.boundedWidth])
              .nice()

            // draw peripherals
            const yAxisGenerator = d3.axisLeft()
              .scale(yScale)
              .ticks(5)

            const yAxis = bounds.append("g")
              .call(yAxisGenerator)

            const yAxisLabel = yAxis.append("text")
              .attr("class", "y-axis-label")
              .attr("fill", "#7E7E7E")
              .attr("transform", "rotate(-90)")
              .attr("x", -dimensions.boundedHeight / 2)
              .attr("y", -dimensions.margin.left + 26)
              .attr("text-anchor", "middle")
              .html("Depth (m)");

            const xAxisGenerator = d3.axisBottom()
              .scale(xScale)
              .ticks(4)

            const xAxis = bounds.append("g")
              .call(xAxisGenerator)
              .style("transform", `translateY(${
                    (dimensions.boundedHeight)
                }px)`)

            const xAxisLabel = xAxis.append("text")
              .attr("class", "x-axis-label")
              .attr("fill", "#7E7E7E")
              .attr("x", dimensions.boundedWidth / 2)
              .attr("y", dimensions.margin.bottom - 6)
              .attr("text-anchor", "middle")
              .html(label)

            // create gridlines
            const gridlinesY = d3.axisTop()
              .tickFormat("")
              .tickSize(-dimensions.boundedHeight)
              .scale(xScale);

            bounds.append("g")
              .attr("class", "grid")
              .call(gridlinesY);

            const gridlinesX = d3.axisLeft()
              .tickFormat("")
              .tickSize(-dimensions.boundedWidth)
              .scale(yScale);

            bounds.append("g")
              .attr("class", "grid")
              .call(gridlinesX);

            // draw line 
            const lineGenerator = d3.line()
              .x(d => xScale(xAccessor(d)))
              .y(d => yScale(yAccessor(d)))
              .curve(d3.curveMonotoneY);

            const line = bounds.append("path")
              .attr("d", lineGenerator(dataset))
              .attr("fill", "none")
              .attr("stroke", "#222")
              .attr("stroke-width", 1.5)
              .attr("class", "line")

            // draw points 
            const dots = bounds.selectAll("circle")
              .data(dataset, d => d[0])

            const newDots = dots.enter().append("circle")

            const allDots = newDots.merge(dots)
              .attr("cx", d => xScale(xAccessor(d)))
              .attr("cy", d => yScale(yAccessor(d)))
              .transition()
              .delay(1400)
              .attr("r", 1.75)
              .attr("fill", "#FF00D8")
              .attr("stroke", "#222")
              .attr("stroke-width", 0.5)

            const oldDots = dots.exit()
              .remove()

            // animation
            const totalLineLength = line.node().getTotalLength();

            line
              .attr("stroke-dasharray", totalLineLength + " " + totalLineLength)
              .attr("stroke-dashoffset", totalLineLength)
              .transition()
              .duration(1100)
              .ease(d3.easeLinear)
              .attr("stroke-dashoffset", 0);

            // create voroni polygons for tooltip hover interactions
            const delaunay = d3.Delaunay.from(
              dataset,
              d => xScale(xAccessor(d)),
              d => yScale(yAccessor(d)),
            )
            const voronoi = delaunay.voronoi()
            voronoi.xmax = dimensions.boundedWidth
            voronoi.ymax = dimensions.boundedHeight

            bounds.selectAll(".voronoi")
              .data(dataset)
              .enter().append("path")
              .attr("class", "voronoi")
              .attr("d", (d, i) => voronoi.renderCell(i))
              //.attr("stroke", "green")
              .on("mouseenter", onMouseEnter)
              .on("mouseleave", onMouseLeave)

            // create tooltip
            const tooltip = d3.select("body")
              .append("div")
              .attr("class", "tooltip2")
              .style("position", "absolute")
              .style("z-index", "10")
              .style("visibility", "hidden")

            // create crosshairs 
            const hoverElementsGroup = bounds.append("g")
              .attr("opacity", 0)

            const horizontalLine = hoverElementsGroup.append("rect")
              .attr("class", "hover-line")

            const verticalLine = hoverElementsGroup.append("rect")
              .attr("class", "hover-line")

            return tooltip
              .style("visibility", "visible")
              .html("<span class='tooltip2-html'>" +
                "<div class='tooltip2-title'>" + "Depth: &thinsp;" + "<span class='tooltip2-num' id='depth'>" +
                "</span></div>" +
                "<div class='tooltip2-text conductivity' value='conductivity'>" + "Conductivity: &thinsp;" +
                "<span class='tooltip2-num' value='conductivity' id='conductivity'>" +
                "</span></div>" +
                "<div class='tooltip2-text'>" + "Density: &thinsp;" +
                "<span class='tooltip2-num' id='sigma_t'>" +
                "</span></div>" +
                "<div class='tooltip2-text'>" + "Dissolved O&#x2082;: &thinsp;" +
                "<span class='tooltip2-num' id='oxygen'>" +
                "</span></div>" +
                "<div class='tooltip2-text'>" + "Fluorescence: &thinsp;" +
                "<span class='tooltip2-num' id='fluorescence'>" + "</span></div>" +
                "<div class='tooltip2-text'>" + "PAR: &thinsp;" + "<span class='tooltip2-num' id='par'>" +
                "</span></div>" +
                "<div class='tooltip2-text'>" + "Salinity: &thinsp;" +
                "<span class='tooltip2-num' id='salinity'>" +
                "</span></div>" +
                "<div class='tooltip2-text'>" + "Temperature: &thinsp;" +
                "<span class='tooltip2-num' id='temperature'>" +
                "</span></div>" +
                "<div class='tooltip2-text'>" + "Turbidity: &thinsp;" + "<span class='tooltip2-num' id='obs'>" +
                "</span></div>" +
                "</span>")

            function onMouseEnter(datum) {

              hoverElementsGroup.style("opacity", 1)

              const dayDot = bounds.append("circle")
                .attr("class", "tooltipDot")
                .attr("cx", xScale(xAccessor(datum)))
                .attr("cy", yScale(yAccessor(datum)))
                .attr("r", 6)
                .style("fill", "yellow")
                .style("stroke", "#FF00D8")
                .attr("stroke-width", 2)
                .style("pointer-events", "none")

              const formatDepth = d => `${d3.format(".0f")(d)} meters`
              tooltip.select("#depth")
                .text(formatDepth(yAccessor(datum)))

              const formatConductivity = d => `${d3.format(".3f")(d)}`
              tooltip.select("#conductivity")
                .text(formatConductivity(datum.conductivity))

              const formatDensity = d => `${d3.format(".3f")(d)}`
              tooltip.select("#sigma_t")
                .text(formatDensity(datum.sigma_t))

              const formatOxygen = d => `${d3.format(".3f")(d)}`
              tooltip.select("#oxygen")
                .text(formatOxygen(datum.oxygen))

              const formatFluorescence = d => `${d3.format(".3f")(d)}`
              tooltip.select("#fluorescence")
                .text(formatFluorescence(datum.fluorescence))

              const formatPAR = d => `${d3.format(".3f")(d)}`
              tooltip.select("#par")
                .text(formatPAR(datum.par))

              const formatSalinity = d => `${d3.format(".3f")(d)}`
              tooltip.select("#salinity")
                .text(formatSalinity(datum.salinity))

              const formatTemperature = d => `${d3.format(".3f")(d)}`
              tooltip.select("#temperature")
                .text(formatTemperature(datum.temperature))

              const formatTurbidity = d => `${d3.format(".3f")(d)}`
              tooltip.select("#obs")
                .text(formatTurbidity(datum.obs))

              const x = xScale(xAccessor(datum)) +
                dimensions.margin.left
              const y = yScale(yAccessor(datum)) +
                dimensions.margin.top

              tooltip.style("transform", `translate(` +
                `calc( -46% + ${x}px),` +
                `calc( 30% + ${y}px)` +
                `)`)

              tooltip.style("opacity", 1)

              // draw crosshairs
              const xLine = xScale(xAccessor(datum))
              const yLine = yScale(yAccessor(datum))

              const hoverLineThickness = 1
              horizontalLine
                .attr("y", yLine)
                .attr("width", dimensions.boundedWidth)
                .attr("height", hoverLineThickness)


              verticalLine
                .attr("x", xLine)
                .attr("width", hoverLineThickness)
                .attr("height", dimensions.boundedHeight)

            }

            function onMouseLeave() {
              d3.selectAll(".tooltipDot")
                .remove()

              tooltip.style("opacity", 0)
              hoverElementsGroup.style("opacity", 0)
            }
          };

        };
        $('#loader').remove();