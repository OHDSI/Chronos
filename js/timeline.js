function Timeline(container, w, h, radius, textHeight) {
  var svg = container.append("svg").attr({
    "width": w,
    "height": h + textHeight
  }).style({
    "border": "solid black 1px"
  });
  var base = svg.append("g").append("g");
  var eventBase = base.append("g");
  var visAxis = svg.append("g").classed({
    "tl-x": true,
    "tl-axis": true
  }).attr({
    "transform": "translate(" + [ 0, h ] + ")"
  });
  var label = base.append("text").classed("tl-label", true).attr({
    "display": "none"
  });

  this.loadEvents = function(events) {
    var types = {};
    var groups = {};
    events.forEach(function(e) {
      types[e["id"]] = Math.min(+e["time"], e["id"] in types ? types[e["id"]] : Number.POSITIVE_INFINITY);
      groups[e["group"]] = true;
    });
    var typeList = Object.keys(types);
    typeList.sort(function(ta, tb) {
      return d3.ascending(types[ta], types[tb]);
    });
    var yPos = {};
    typeList.forEach(function(tid, ix) {
      yPos[tid] = h - ix * radius;
    });

    var times = events.map(function(e) {
      return +e["time"];
    });

    var xScale = d3.time.scale().domain([ d3.min(times), d3.max(times) ]).range([ 0, w ]).nice();
    var visScale = xScale.copy();
    var xAxis = d3.svg.axis().scale(visScale).tickSize(-h).tickSubdivide(true);
    visAxis.call(xAxis);

    var groupScale = d3.scale.category10().domain(Object.keys(groups));

    function zoom() {
      var move = d3.event.translate;
      var s = d3.event.scale;
      base.attr({
        "transform": "translate(" + move + ") scale(" + s + ")"
      });
      visScale.range([ move[0], move[0] + w * s ]);
      visAxis.call(xAxis);
      label.attr({
        "font-size": 16 / s
      });
    }

    svg.call(d3.behavior.zoom().scaleExtent([ 0.5, 8 ]).on("zoom", zoom));

    var sel = eventBase.selectAll("circle.tl-event").data(events);
    sel.exit().remove();
    sel.enter().append("circle").classed("tl-event", true);
    sel.attr({
      "cx": function(e) {
        return xScale(+e["time"]);
      },
      "cy": function(e) {
        return yPos[e["id"]];
      },
      "r": radius,
      "fill": function(e) {
        return groupScale(e["group"]);
      }
    }).on("mouseover", function(e) {
      var cur = d3.select(this);
      cur.transition().duration(100).attr({
        "r": 2 * radius
      });
      label.attr({
        "display": null,
        "x": cur.attr("cx"),
        "y": cur.attr("cy")
      }).text(e["name"]);
    }).on("mouseout", function(e) {
      var cur = d3.select(this);
      cur.transition().duration(100).attr({
        "r": radius
      });
    });
  };
} // Timeline
