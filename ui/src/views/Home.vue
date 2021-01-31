<template>
  <div class="home">
    <div class="flex">
      <div class="w-1/3">
        <div class="flex flex-col">
          <header class="px-6 flex flex-grow">
            <v-form @submit.prevent="search" class="w-full mr-4">
              <v-text-field
                v-model="form.inputs.search"
                color="primary"
                :loading="form.state.searching"
                :disabled="form.state.searching"
              ></v-text-field>
            </v-form>
            <v-btn class="mt-4" large icon>
              <v-icon large>
                mdi-fullscreen
              </v-icon>
            </v-btn>
          </header>
          <section class="mt-2 px-6">
            <v-menu offset-y>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  color="primary"
                  dark
                  block
                  v-bind="attrs"
                  v-on="on"
                >
                  All sections in report
                </v-btn>
              </template>
              <v-list>
                <v-list-item
                  v-for="(item, index) in items"
                  :key="index"
                  class="hover:bg-gray-100"
                >
                  <v-list-item-title>{{ item.title }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </section>
          <section class="px-6 my-6">
            BAR
          </section>
          <section class="flex px-6">
            <div class="w-1/2">
              <v-checkbox
                v-model="form.inputs.checkboxs.checkbox1"
                label="Checkbox 1"
              ></v-checkbox>
              <v-checkbox
                v-model="form.inputs.checkboxs.checkbox2"
                label="Checkbox 2"
              ></v-checkbox>
              <v-checkbox
                v-model="form.inputs.checkboxs.checkbox3"
                label="Checkbox 3"
              ></v-checkbox>
            </div>
            <div class="w-1/2">
              <v-checkbox
                v-model="form.inputs.checkboxs.checkbox4"
                label="Checkbox 4"
              ></v-checkbox>
              <v-checkbox
                v-model="form.inputs.checkboxs.checkbox5"
                label="Checkbox 5"
              ></v-checkbox>
              <v-checkbox
                v-model="form.inputs.checkboxs.checkbox6"
                label="Checkbox 6"
              ></v-checkbox>
            </div>
          </section>
          <section class="flex flex-col px-6">

          </section>
          <footer class="absolute bottom-0 px-6 py-2 w-1/3 flex justify-between">
            <v-btn large icon>
              <v-icon large>
                mdi-reload
              </v-icon>
            </v-btn>
            <div>
              <p>X selected</p>
            </div>
            <div>
              <v-btn large icon>
                <v-icon large>
                  mdi-check-all
                </v-icon>
              </v-btn>
              <v-btn large icon>
                <v-icon large>
                  mdi-share-all
                </v-icon>
              </v-btn>
            </div>
          </footer>
        </div>
      </div>
      <div id="map" class="h-screen w-2/3">
        <div id="svg"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { SVG } from '@svgdotjs/svg.js'
import { get_clusters } from '../coords_clusterizer'

export default {
  name: 'Home',
  created() {
    var rawSchools = require('../../schools.json')
    this.rawSchools = rawSchools.filter((school, i) => i < 50).map((school) => {
      const negative = Math.round(Math.random() * 10) / 30
      const neutral = Math.round(Math.random() * 10) / 30
      const positive = 1 - negative - neutral
      return {
        id: `school-${school.AIRO_ID}`,
        lngLat: [school.Long, school.Lat],
        cluster: false,
        sentiment: { negative, neutral, positive },
      }
    })
    this.schools = this.rawSchools
  },
  mounted() {
    this.$mapbox.accessToken = 'pk.eyJ1IjoidmVzdGlidWxlIiwiYSI6ImNra2owMThuMDBicWMycHM3bXZrYXQ4ZGEifQ.rLhfcVbpIuVFUd0lxE4StA'
    this.map = new this.$mapbox.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/light-v10',
      zoom: 8,
      center: [-6.3857859, 53.3242381],
    });

    this.map.on('load', () => {
      this.computeClusters()
      // const bounds = this.map.getBounds()

      // console.log({bounds}, bounds._ne.lat - bounds._sw.lat, bounds._ne.lng - bounds._sw.lng)

      // const height = bounds._ne.lat - bounds._sw.lat
      // const width = bounds._ne.lng - bounds._sw.lng
    
      // const clusters = get_clusters(
      //   this.mapMetadatas.center[0],
      //   this.mapMetadatas.center[1],
      //   height,
      //   width,
      //   Math.min(height, width) / 10,
      //   this.schools.map((school) => {
      //     return {
      //       id: `school-${school.AIRO_ID}`,
      //       long: school.lngLat[0],
      //       lat: school.lngLat[1],
      //       isCluster: true,
      //       sentiment: { negative: school.negative, neutral: school.neutral, positive: school.positive },
      //     }
      //   })
      // )

      // console.log(clusters)

      // // this.schools = [...this.schools, ...clusters]

      // this.schools = clusters

      // this.schools.forEach(school => {
      //   if(school.isCluster) {
      //     console.log('painting a cluster', {cluster: school})
      //     this.drawMarker([school.long, school.lat], { red: .9, green: .05, blue: .05 }, school.id)
      //   } else {
      //     this.drawMarker(school.lngLat, { red: school.sentiment.negative, green: school.sentiment.positive, blue: school.sentiment.neutral }, school.id)
      //   }
      // });
    })

    this.map.on('zoomend', () => {
      this.computeClusters()
    });
  },
  data: () => ({
    dump: null,
    rawSchools: [],
    items: [
      { title: 'Abstract' },
      { title: '1. Leadership & management' },
      { title: '2. Teaching & learning' },
      { title: '3. Feedback from former evaluations' },
      { title: '4. Self-evaluation & improvement' },
      { title: 'Appendix' },
    ],
    map: null,
    mapMetadatas: {
      center: [-6.3857859, 53.3242381],
    },
    marker: {
      circle: {
        radius: 20,
      }
    },
    markers: [],
    schools: [],
    form: {
      inputs: {
        search: '',
        checkboxs: {
          checkbox1: false,
          checkbox2: false,
          checkbox3: false,
          checkbox4: false,
          checkbox5: false,
          checkbox6: false,
          checkbox7: false,
        }
      },
      state: {
        searching: false
      },
    },
  }),
  methods: {
    search() {
      this.form.state.searching = true
      setTimeout(() => {
        this.form.state.searching = false
      }, 1500)
    },
    computeClusters() {
      this.markers.forEach((id) => {
        const el = document.getElementById(id)
        el.parentNode.removeChild(el)
      })

      this.markers = []
      const bounds = this.map.getBounds()

      const height = bounds._ne.lat - bounds._sw.lat
      const width = bounds._ne.lng - bounds._sw.lng

      const clusters = get_clusters(
        this.map.getCenter().lng,
        this.map.getCenter().lat,
        height,
        width,
        Math.min(height, width) / 10,
        this.rawSchools.map((school) => {
          return {
            id: school.id,
            long: school.lngLat[0],
            lat: school.lngLat[1],
            isCluster: false,
            sentiment: { negative: school.sentiment.negative, neutral: school.sentiment.neutral, positive: school.sentiment.positive },
          }
        })
      )

      this.schools = clusters.filter(cluster => cluster.schools.length > 0).map((cluster) => {
        if(cluster.schools.length > 1) {
          return cluster
        }

        return cluster.schools[0]
      })

      this.markers = this.schools.map((school) => {
        return school.id
      })

      this.schools.forEach(school => {
        if(school.isCluster) {
          console.log('painting a cluster', {cluster: school})
          this.drawMarker([school.long, school.lat], { red: .9, green: .05, blue: .05 }, school.id, school.schools.length)
        } else {
          console.log('painting a school', {school})
          this.drawMarker([school.long, school.lat], { red: school.sentiment.negative, green: school.sentiment.positive, blue: school.sentiment.neutral }, school.id)
        }
      });
    },
    drawMarker(lngLat, rgb, id, n = 1) {
      const newMarker = document.createElement('div')
      newMarker.id = id
      document.body.appendChild(newMarker)

      this.drawColorArc(rgb, id, n)

      new this.$mapbox.Marker({element: document.getElementById(id)})
        .setLngLat(lngLat)
        .addTo(this.map)
    },
    drawColorArc({ red, green, blue }, id, n = 1) {
    // rouge à gauche, vert à droite, bleu en haut

      const greenRad = green * Math.PI * 2;
      const redRad = red * Math.PI * 2;
      const blueRad = blue * Math.PI * 2;

      var draw = SVG().addTo(`#${id}`).size(this.marker.circle.radius * 4, this.marker.circle.radius * 4)
      draw.attr('id', 'test')

      const circle = draw.circle(this.marker.circle.radius * 2)
      circle.attr({cx: this.marker.circle.radius * 2, cy: this.marker.circle.radius * 2, })

      if(n > 1) {
        const text = draw.text(n.toString())
        text.move(Math.round(this.marker.circle.radius * 2 - this.marker.circle.radius / 5.5), Math.round(this.marker.circle.radius * 2 - this.marker.circle.radius / 2))
        text.font({ fill: '#FFF', family: 'Inconsolata', size: Math.round(this.marker.circle.radius * 0.8), })
      }
      console.log({args: [[this.marker.circle.radius * 2, this.marker.circle.radius * 2], [this.marker.circle.radius, this.marker.circle.radius], [0, redRad], Math.PI / 2]})
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
