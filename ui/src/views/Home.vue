<template>
  <div class="home">
    <v-dialog
      v-model="dialog"
      persistent
      max-width="600"
    >
      
      <v-card>
        <v-card-title>
          <span class="headline">Send report</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  label="Email*"
                  required
                ></v-text-field>
              </v-col>
              </v-col>
              <v-col
                cols="12"
                sm="6"
              >
                <v-textarea
                  name="input-7-1"
                  label="Message..."
                  value="Could you take a look at this?"
                ></v-textarea>
              </v-col>
            </v-row>
          </v-container>
          <small>*indicates required field</small>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            text
            @click="dialog = false"
          >
            Close
          </v-btn>
          <v-btn
            color="blue darken-1"
            text
            @click="dialog = false"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <div class="flex">
      <div class="w-1/3 h-screen overflow-y-scroll">
        <div class="flex flex-col">
          <header class="px-6 flex flex-grow">
            <v-form @submit.prevent="search" class="w-full mr-4">
              <v-text-field
                v-model="form.inputs.search"
                color="primary"
                :loading="form.state.searching"
                :disabled="form.state.searching"
                autocomplete="off"
              ></v-text-field>
            </v-form>
            <v-btn @click="tweakSearch = !tweakSearch" class="mt-4" large icon :class="{ 'transform rotate-90': !tweakSearch  }">
              <v-icon large>
                mdi-arrow-down-drop-circle-outline
              </v-icon>
            </v-btn>
          </header>
          <div v-if="tweakSearch">
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
            <section class="flex px-6">
              <v-radio-group v-model="form.inputs.topic" class="w-full">
                <div class="flex flex-row justify-between">
                  <div class="w-1/2">
                    <template v-for="(topic, i) in form.radio.topics">
                      <v-radio
                        v-if="i < 3"
                        :key="i"
                        :label="topic"
                        :value="topic"
                      ></v-radio>
                    </template>
                  </div>
                  <div class="w-1/2">
                    <template v-for="(topic, i) in form.radio.topics">
                      <v-radio
                        v-if="i > 2"
                        :key="i"
                        :label="topic"
                        :value="topic"
                      ></v-radio>
                    </template>
                  </div>
                </div>
              </v-radio-group>
            </section>
            <section class="px-4" v-if="searchResults.length > 0">
              <img src="/img/histo.png" alt="">
            </section>
          </div>
          <section class="flex flex-col bg-blue-50 overflow-y-auto">
            <div v-for="(searchResult, i) in searchResults" :key="i" class="mt-1 py-2 px-6">
              <header class="flex">
                <div class="flex flex-col justify-around">
                  <v-simple-checkbox
                    v-model="searchResult.checked"
                    dense
                  ></v-simple-checkbox>
                  <v-btn @click="dialog = true" dense icon>
                    <v-icon dense>
                      mdi-share
                    </v-icon>
                  </v-btn>
                  <v-btn @click="openLink" dense icon>
                    <v-icon dense>
                      mdi-book-open
                    </v-icon>
                  </v-btn>
                </div>
                <div class="flex-col">
                  <h3 class="font-semibold text-lg">
                    {{ searchResult.name }}
                  </h3>
                  <div class="flex">
                    <h4 class="italic font-semibold mr-2 text-sm">
                      {{ searchResult.date }}
                    </h4>
                    <h4 class="italic mr-2 text-sm">
                      {{ searchResult.county }}
                    </h4>
                    |
                    <h4 class="ml-1 italic text-sm">
                      {{ searchResult.inspectionType }}
                    </h4>
                    <h4 class="italic text-sm ml-1">
                      {{ searchResult.level }}
                    </h4>
                </div>
                </div>
                <div class="flex">
                </div>
              </header>
              <section>
                <p class="text-justify">{{ searchResult.report.abstract_100 }}</p>
              </section>
              <hr class="mt-4">
            </div>
          </section>
          <footer class="absolute bottom-0 px-4 py-1 w-1/3 bg-white flex justify-between">
            <v-btn large icon>
              <v-icon large>
                mdi-reload
              </v-icon>
            </v-btn>
            <div>
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
    this.rawSchools = rawSchools.filter((school, i) => i < 10000).map((school) => {
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
    })

    this.map.on('zoomend', () => {
      this.computeClusters()
    });
    this.map.on('moveend', () => {
      this.computeClusters()
    });
  },
  data: () => ({
    dialog: false,
    dump: null,
    tweakSearch: true,
    rawSchools: [],
    results: [
      {

      }
    ],
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
    searchResults: [],
    form: {
      inputs: {
        search: '',
        topic: '',
      },
      radio: {
        topics: [
          'sport',
          'organization',
          'litterature',
          'science',
          'illegal',
          'exams',
        ]
      },
      state: {
        searching: false
      },
    },
  }),
  methods: {
    openLink() {
      window.open('https://www.education.ie/en/Publications/Inspection-Reports-Publications/Whole-School-Evaluation-Reports-List/65190W_WSEMLLPP_13485_20191203.pdf', '_blank')
    },
    async search() {
      this.form.state.searching = true

      const resSearch = await this.$api.get('search', {
        params: {
          searchWord: this.form.inputs.search,
          topic: this.form.inputs.topic,
          size: 20
        }
      })

      const results = resSearch.data.hits.hits.map((result) => {
        return {
          score: result._score,
          county: result._source.County,
          date: result._source.Date.replace('_', '/').replace('_', '/'),
          inspectionType: result._source['Inspection Type'],
          level: result._source['School Level'],
          name: result._source['School Name'],
          rollNo: result._source['School Roll No.'],
          pdf: result._source.URL,
          report: {
            abstract_100: result._source.report.substring(result._source.report.indexOf('happy') - 100, result._source.report.indexOf('happy') + 100),
            // report: result._source.report.substring(result._source.report.indexOf('1.'), 2000)
          },
          checked: false,
        }
      })

      this.searchResults = results

      this.form.state.searching = false
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
        Math.min(height, width) / 5,
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
          const negative = Math.round(Math.random() * 10) / 30
          const neutral = Math.round(Math.random() * 10) / 30
          const positive = 1 - negative - neutral
          this.drawMarker([school.long, school.lat], { red: negative, green: neutral, blue: positive }, school.id, school.schools.length)
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

      console.log({n})
      if(n > 1) {
        const text = draw.text(n.toString())
        if(n.toString().length === 1) {
          text.move(Math.round(this.marker.circle.radius * 2 - this.marker.circle.radius / 5.5), Math.round(this.marker.circle.radius * 2 - this.marker.circle.radius / 2))
        } else if (n.toString().length === 2) {
          text.move(Math.round(this.marker.circle.radius * 2 - this.marker.circle.radius / 3), Math.round(this.marker.circle.radius * 2 - this.marker.circle.radius / 2))
        } else {
          text.move(Math.round(this.marker.circle.radius * 2 - this.marker.circle.radius / 1.3), Math.round(this.marker.circle.radius * 2 - this.marker.circle.radius / 2))
        }
        text.font({ fill: '#FFF', family: 'Inconsolata', size: Math.round(this.marker.circle.radius * 0.8), })
      } else {
        const schoolSvg = draw.path('M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z')
        schoolSvg.move(Math.round(this.marker.circle.radius * 2 - this.marker.circle.radius / 2), Math.round(this.marker.circle.radius * 2 - this.marker.circle.radius / 2))
        schoolSvg.fill('none')
        schoolSvg.stroke({ color: '#FFF', width: 1 })
      }
      const RedArc = draw.path(this.drawArc([this.marker.circle.radius * 2, this.marker.circle.radius * 2], [this.marker.circle.radius, this.marker.circle.radius], [0, redRad], Math.PI / 2))
      RedArc.fill('none')
      RedArc.stroke({ color: '#DC2626', width: Math.round(this.marker.circle.radius / 2.5)})

      const blueArc = draw.path(this.drawArc([this.marker.circle.radius * 2, this.marker.circle.radius * 2], [this.marker.circle.radius, this.marker.circle.radius], [0, blueRad], Math.PI / 2 + redRad))
      blueArc.fill('none')
      blueArc.stroke({ color: '#059669', width: Math.round(this.marker.circle.radius / 2.5)})

      const greenArc = draw.path(this.drawArc([this.marker.circle.radius * 2, this.marker.circle.radius * 2], [this.marker.circle.radius, this.marker.circle.radius], [0, greenRad], Math.PI / 2 + redRad + blueRad))
      greenArc.fill('none')
      greenArc.stroke({ color: '#3B82F6', width: Math.round(this.marker.circle.radius / 2.5)})
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
