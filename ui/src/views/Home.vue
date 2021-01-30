<template>
  <div class="home">
    <div id="svg"></div>
    <div id="map" class="h-screen"></div>
    <img alt="Vue logo" src="../assets/logo.png">
  </div>
</template>

<script>
import { SVG } from '@svgdotjs/svg.js'

export default {
  name: 'Home',
  mounted() {
    // this.drawColorArc(.3, .4, .3) // R G B

    this.$mapbox.accessToken = 'pk.eyJ1IjoidmVzdGlidWxlIiwiYSI6ImNra2owMThuMDBicWMycHM3bXZrYXQ4ZGEifQ.rLhfcVbpIuVFUd0lxE4StA'
    this.map = new this.$mapbox.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/light-v10',
      zoom: 8,
      center: [-6.3857859, 53.3242381],
    });

    this.map.on('load', () => {
      this.schools.map((schools) => {
        return schools
      }).forEach(school => {
        this.drawMarker(school.lngLat, { red: school.sentiment.negative, green: school.sentiment.positive, blue: school.sentiment.neutral }, school.id)
      });
      // this.drawMarker([-6.4118180, 53.285170], { red: .3, green: .6, blue: .1 }, 'school_1')
      // this.drawMarker([-6.368400, 53.369120], { red: .2, green: .2, blue: .6 }, 'school_2')
      // this.drawMarker([-6.411330, 53.657190], { red: .7, green: .1, blue: .2 }, 'school_3')

      // new this.$mapbox.Marker({element: document.getElementById('test')})
      //   .setLngLat([-6.4118180, 53.285170])
      //   .addTo(this.map)

      // new this.$mapbox.Marker()
      //   .setLngLat([-6.368400, 53.369120])
      //   .addTo(this.map)

      // new this.$mapbox.Marker()
      //   .setLngLat([-6.411330, 53.657190])
      //   .addTo(this.map)
    })
  },
  data: () => ({
    map: null,
    marker: {
      circle: {
        radius: 20,
      }
    },
    schools: [
      {
        lngLat: [-6.4118180, 53.285170],
        sentiment: { negative: .2, positive: .2, neutral: .6 },
        id: 'school_1'
      },
      {
        lngLat: [-6.368400, 53.369120],
        sentiment: { negative: .2, positive: .2, neutral: .6 },
        id: 'school_2'

      },
      {
        lngLat: [-6.411330, 53.657190],
        sentiment: { negative: .7, positive: .1, neutral: .2 },
        id: 'school_3'
      }
    ]
  }),
  methods: {
    drawMarker(lngLat, rgb, id) {
      const newMarker = document.createElement('div')
      newMarker.id = id
      document.body.appendChild(newMarker)

      this.drawColorArc(rgb, id)

      new this.$mapbox.Marker({element: document.getElementById(id)})
        .setLngLat(lngLat)
        .addTo(this.map)
    },
    drawColorArc({ red, green, blue }, id) {
    // rouge à gauche, vert à droite, bleu en haut

      const greenRad = green * Math.PI * 2;
      const redRad = red * Math.PI * 2;
      const blueRad = blue * Math.PI * 2;

      var draw = SVG().addTo(`#${id}`).size(this.marker.circle.radius * 4, this.marker.circle.radius * 4)
      draw.attr('id', 'test')

      const circle = draw.circle(this.marker.circle.radius * 2)
      circle.attr({cx: this.marker.circle.radius * 2, cy: this.marker.circle.radius * 2, })

      const text = draw.text('4')
      text.move(Math.round(this.marker.circle.radius * 2 - this.marker.circle.radius / 5.5), Math.round(this.marker.circle.radius * 2 - this.marker.circle.radius / 2))
      text.font({ fill: '#FFF', family: 'Inconsolata', size: Math.round(this.marker.circle.radius * 0.8), })

      const RedArc = draw.path(this.drawArc([this.marker.circle.radius * 2, this.marker.circle.radius * 2], [this.marker.circle.radius, this.marker.circle.radius], [0, redRad], Math.PI / 2))
      RedArc.fill('none')
      RedArc.stroke({ color: '#F00', width: Math.round(this.marker.circle.radius / 2.5)})

      const blueArc = draw.path(this.drawArc([this.marker.circle.radius * 2, this.marker.circle.radius * 2], [this.marker.circle.radius, this.marker.circle.radius], [0, blueRad], Math.PI / 2 + redRad))
      blueArc.fill('none')
      blueArc.stroke({ color: '#00F', width: Math.round(this.marker.circle.radius / 2.5)})

      const greenArc = draw.path(this.drawArc([this.marker.circle.radius * 2, this.marker.circle.radius * 2], [this.marker.circle.radius, this.marker.circle.radius], [0, greenRad], Math.PI / 2 + redRad + blueRad))
      greenArc.fill('none')
      greenArc.stroke({ color: '#0F0', width: Math.round(this.marker.circle.radius / 2.5)})
    },
    drawArc([cx,cy],[rx,ry], [t1, Δ], φ) {
      const cos = Math.cos;
      const sin = Math.sin;
      const π = Math.PI;

      const f_matrix_times = (( [[a,b], [c,d]], [x,y]) => [ a * x + b * y, c * x + d * y]);
      const f_rotate_matrix = (x => [[cos(x),-sin(x)], [sin(x), cos(x)]]);
      const f_vec_add = (([a1, a2], [b1, b2]) => [a1 + b1, a2 + b2]);
      /* [
      returns a SVG path element that represent a ellipse.
      cx,cy → center of ellipse
      rx,ry → major minor radius
      t1 → start angle, in radian.
      Δ → angle to sweep, in radian. positive.
      φ → rotation on the whole, in radian
      URL: SVG Circle Arc http://xahlee.info/js/svg_circle_arc.html
      Version 2019-06-19
      ] */

      Δ = Δ % (2*π);
      const rotMatrix = f_rotate_matrix (φ);
      const [sX, sY] = ( f_vec_add ( f_matrix_times ( rotMatrix, [rx * cos(t1), ry * sin(t1)] ), [cx,cy] ) );
      const [eX, eY] = ( f_vec_add ( f_matrix_times ( rotMatrix, [rx * cos(t1+Δ), ry * sin(t1+Δ)] ), [cx,cy] ) );
      const fA = ( (  Δ > π ) ? 1 : 0 );
      const fS = ( (  Δ > 0 ) ? 1 : 0 );
      // const path_2wk2r = document.createElementNS("http://www.w3.org/2000/svg", "path");
      return "d", "M " + sX + " " + sY + " A " + [ rx , ry , φ / (2*π) *360, fA, fS, eX, eY ].join(" ");
      // return path_2wk2r;
    },
    distance([lat1, lon1], [lat2, lon2]) {
      if ((lat1 == lat2) && (lon1 == lon2)) {
        return 0;
      }
      else {
        var radlat1 = Math.PI * lat1/180;
        var radlat2 = Math.PI * lat2/180;
        var theta = lon1-lon2;
        var radtheta = Math.PI * theta/180;
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
          dist = 1;
        }
        dist = Math.acos(dist);
        dist = dist * 180/Math.PI;
        dist = dist * 60 * 1.1515;
        return dist;
      }
    }
  }
}
</script>
