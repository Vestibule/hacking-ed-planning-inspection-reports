function make2darray(d1 = 0, d2 = 0){
	var r = Array(d1);
    for (var i = 0 ; i < d1 ; i++) { r[i] = Array(d2); }
    return r;
}

class coordinates {
    constructor(x = 0, y = 0) {
        this._x = x;
        this._y = y;
    }
    clone() { return new coordinates(this._x, this._y); }

    getX() { return this._x; }
    getY() { return this._y; }

    add(coords){ return new coordinates(this._x + coords._x, this._y + coords._y); }
    sub(coords){ return new coordinates(this._x - coords._x, this._y - coords._y); }
    mul(a){ return new coordinates(this._x * a, this._y * a); }
    div(a){ return new coordinates(this._x / a, this._y / a); }

    distance(dest){
        var dx = this._x - dest._x;
        var dy = this._y - dest._y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    tostr(){
        return "[" + this._x + ", " + this._y + "]";
    }
}

class cluster_item {
    constructor(item_id = 0, coords = new coordinates(0, 0)) {
        this._item_id = item_id;
        this._coords = coords;

    }
    get_coords(){ return this._coords; }
    get_item_id() { return this._item_id; }
}

class cluster {
    constructor(cluster_items = []) {
        this._center = new coordinates(0, 0);
        this._cluster_items = cluster_items;
        for (var e of cluster_items) {
            this._center = this._center.add(e.get_coords());
            //console.log("ADD " + e.get_coords().tostr());
        }
        //console.log("somme : " + this._center.tostr());
        this._center = this._center.div(cluster_items.length);
        //console.log("moyenne : " + this._center.tostr());
        //var a = this;
        //console.log(JSON.stringify(a));
    }
    get_coords() { return this._center; }
    
    append_cluster_item(item = new cluster_item()){
        var weight_this = this._cluster_items.length / (this._cluster_items.length + 1);
        var weight_b = 1 / (this._cluster_items.length + 1);
        this._center = this._center.mul(weight_this).add(item.get_coords().mul(weight_b));
        this._cluster_items.push(item);
    }

    append_cluster_items(cluster_b = new cluster()){
        var weight_this = this._cluster_items.length / (this._cluster_items.length + cluster_b._cluster_items.length);
        var weight_b = cluster_b._cluster_items.length / (this._cluster_items.length + cluster_b._cluster_items.length);
        this._center = this._center.mul(weight_this).add(cluster_b._center.mul(weight_b))
        this._cluster_items = this._cluster_items.concat(cluster_b._cluster_items);
    }
}

function getClusters_1stpass(map_center = new coordinates(0,0), map_height = 0.0, map_width = 0.0, school_coordinates = []){
    // pre-clustering using grid based clustering
	var xmin = map_center.getX() - map_width / 2;
	var xmax = map_center.getX() + map_width / 2;
	var ymin = map_center.getY() - map_height / 2;
	var ymax = map_center.getY() + map_height / 2;
	var grid_size_x = 20;
	var dx = map_width / grid_size_x;
	var grid_size_y = 20;
	var dy = map_height / grid_size_y;
	
	var my_2d_array = make2darray(grid_size_x,grid_size_y);
	
	school_coordinates.forEach(function (e, i){
        if (e.getX() < xmin || e.getX() > xmax || e.getY() < ymin || e.getY() > ymax) return;
        var xindex = Math.floor((e.getX() - xmin) / dx);
        var yindex = Math.floor((e.getY() - ymin)/ dy);
        if (my_2d_array[xindex][yindex] == undefined){
            my_2d_array[xindex][yindex] = [];
        }
		my_2d_array[xindex][yindex].push(new cluster_item(i, e));
	});
	var r = []
	for (var e of my_2d_array){
		for (var ee of e){
			if (ee == undefined){
                continue;
            }
            r.push(new cluster(ee));
		}
	}
	return r;
}

function getClusters_2ndpass_get_next_merge(dist_matrix = [[]], max_dist = 0.0){
    // find closest cluster pair
    var current_min = Infinity;
    var r = [undefined, undefined];
    dist_matrix.forEach(function (e, i){
        for (var j = i + 1 ; j < e.length ; j++){
            if (e[j] < current_min){
                r = [i,j];
                current_min = e[j];
            }
        }
    });
    if (current_min > max_dist) return [undefined, undefined];
    return r;
}

function getClusters_2ndpass_merge(dist_matrix = [[]], i = 0, j = 0, clusters = []){
    // merge a pair of clusters
    clusters[i].append_cluster_items(clusters[j]);
    // remove j from clusters and distances matrix
    clusters.splice(j,1);
    dist_matrix.splice(j,1);
    for (var e of dist_matrix){
        e.splice(j,1);
    }
    // update distances matrix for cluster i
     for(var j = i + 1 ; j < dist_matrix.length ; j++){
        dist_matrix[i][j] = clusters[i].get_coords().distance(clusters[j].get_coords());
    }
    j = i;
    for(var i = 0 ; i < dist_matrix.length ; i++){
        dist_matrix[i][j] = clusters[i].get_coords().distance(clusters[j].get_coords());
    }
}

function getClusters_2ndpass(map_center = new coordinates(0,0), map_height = 0.0, map_width = 0.0, max_dist = 0.0, clusters = []){
    // iteratively merge the closest pair of clusters up until no pair is closer than max_dist
    var dist_matrix = make2darray(clusters.length, clusters.length);
    // init distance matrix
    //var dist_matrix_init_start = performance.now();
	clusters.forEach( function(e, i) {
		for (var j = i+1 ; j < clusters.length ; j++){
			dist_matrix[i][j] = e.get_coords().distance(clusters[j].get_coords());
		}
    });
    //var dist_matrix_init_end = performance.now();
    //console.log("distances matrix initialized in " + (dist_matrix_init_end - dist_matrix_init_start) + "ms");

    var next_merge = getClusters_2ndpass_get_next_merge(dist_matrix, max_dist);
    //var merge_count = 0;
    while(next_merge[0] != undefined){
        getClusters_2ndpass_merge(dist_matrix, next_merge[0], next_merge[1], clusters);
        next_merge = getClusters_2ndpass_get_next_merge(dist_matrix, max_dist);
        //merge_count ++;
    }
    //console.log("merge_count = " + merge_count);
}


function getClusters_internal(map_center = new coordinates(0,0), map_height = 0.0, map_width = 0.0, max_dist = 0.0, school_coordinates = []){
    //console.log("getClusters : ");
    //var first_pass_start = performance.now();
    var clusters = getClusters_1stpass(map_center, map_height, map_width, school_coordinates);
    //var first_pass_end = performance.now();
    //console.log("first pass ended after " + (first_pass_end - first_pass_start) + "ms");
    
    //var second_pass_start = performance.now();
    getClusters_2ndpass(map_center, map_height, map_width, max_dist, clusters);
    //var second_pass_end = performance.now();
    //console.log("second pass ended after " + (second_pass_end - second_pass_start) + "ms");
    return clusters;
}

function get_clusters(map_center_long, map_center_lat, map_height, map_width, max_clustering_distance, schools_list){
    var schools_coordinates = schools_list.map(x => {return new coordinates(x.long, x.lat)});
    var clusters = getClusters_internal(new coordinates(map_center_long, map_center_lat), map_height, map_width, max_clustering_distance, schools_coordinates);

    var r = new Array(clusters.length);
    clusters.forEach( function (e,i){
        r[i] = {
            id: `cluster${i}`,
            long: clusters[i].get_coords().getX(),
            lat: clusters[i].get_coords().getY(),
            isCluster: true,
            schools: new Array(e._cluster_items.length),
            sentiment: {negative: 0, neutral: 1, positive: 0}
        }
        e._cluster_items.forEach( function (ee,ii){
            r[i].schools[ii] = schools_list[ee.get_item_id()];
        });
    });
    return r;
}

export {
    get_clusters,
}


function test(){
    // test parameters
    var n_coords = 10000;
    var map_center = new coordinates(500,500);
    var map_height = 800;
    var map_width = 800;
    var max_dist = 200;


    // init test
    test_coords = new Array(n_coords);
    for (var i = 0 ; i < n_coords ; i ++){
        test_coords[i] = new coordinates(Math.random() * map_width + map_center.getX() - map_width / 2, Math.random() * map_height + map_center.getY() - map_height / 2);
    }

    console.log("test initialized ");
//    for (var e of test_coords){
//        console.log(e.tostr());
//    }

    // run test
    console.log("running test : ");
    var test_start = performance.now();

    var clusters = getClusters_internal(map_center, map_height, map_width, max_dist, test_coords);

    var test_end = performance.now();
    // check results
    console.log("test ended after " + (test_end - test_start) + "ms");
    console.log("test returned " + clusters.length + " clusters");
    clusters.forEach( function(e,i) {
        console.log("clusters[" + i +  "] (" + e._cluster_items.length + " items)");
//        for (var ee of e._cluster_items){
//            console.log("    [" + ee.item_id + " : " + ee.get_coords().tostr() + "]");
//        }
    });
    console.log("all done");
}

//test();


function test2(){
    var map_center_long = -6.3857859;
    var map_center_lat =53.3242381;
    var map_height = 1.315700007418883;
    var map_width = 2.6367187499999147;
    var max_clustering_distance = 0.1315700007418883;
    var schools_list = [
        {"id":"school-undefined","long":-6.91956,"lat":52.5993,"cluster":true,"sentiment":{"negative":"__vue_devtool_undefined__","neutral":"__vue_devtool_undefined__","positive":"__vue_devtool_undefined__"}},
        {"id":"school-undefined","long":-6.62828,"lat":52.8124,"cluster":true,"sentiment":{"negative":"__vue_devtool_undefined__","neutral":"__vue_devtool_undefined__","positive":"__vue_devtool_undefined__"}},
        {"id":"school-undefined","long":-6.92923,"lat":52.6485,"cluster":true,"sentiment":{"negative":"__vue_devtool_undefined__","neutral":"__vue_devtool_undefined__","positive":"__vue_devtool_undefined__"}},
        {"id":"school-undefined","long":-6.87567,"lat":52.7225,"cluster":true,"sentiment":{"negative":"__vue_devtool_undefined__","neutral":"__vue_devtool_undefined__","positive":"__vue_devtool_undefined__"}},
        {"id":"school-undefined","long":-6.79887,"lat":52.7872,"cluster":true,"sentiment":{"negative":"__vue_devtool_undefined__","neutral":"__vue_devtool_undefined__","positive":"__vue_devtool_undefined__"}},
        {"id":"school-undefined","long":-7.03297,"lat":52.7394,"cluster":true,"sentiment":{"negative":"__vue_devtool_undefined__","neutral":"__vue_devtool_undefined__","positive":"__vue_devtool_undefined__"}},
        {"id":"school-undefined","long":-6.78127,"lat":52.8373,"cluster":true,"sentiment":{"negative":"__vue_devtool_undefined__","neutral":"__vue_devtool_undefined__","positive":"__vue_devtool_undefined__"}},
        {"id":"school-undefined","long":-6.83898,"lat":52.6581,"cluster":true,"sentiment":{"negative":"__vue_devtool_undefined__","neutral":"__vue_devtool_undefined__","positive":"__vue_devtool_undefined__"}},
        {"id":"school-undefined","long":-6.95892,"lat":52.7001,"cluster":true,"sentiment":{"negative":"__vue_devtool_undefined__","neutral":"__vue_devtool_undefined__","positive":"__vue_devtool_undefined__"}},
        {"id":"school-undefined","long":-6.95411,"lat":52.7,"cluster":true,"sentiment":{"negative":"__vue_devtool_undefined__","neutral":"__vue_devtool_undefined__","positive":"__vue_devtool_undefined__"}},
        {"id":"school-undefined","long":-6.73301,"lat":52.8003,"cluster":true,"sentiment":{"negative":"__vue_devtool_undefined__","neutral":"__vue_devtool_undefined__","positive":"__vue_devtool_undefined__"}},
        {"id":"school-undefined","long":-6.73187,"lat":52.8037,"cluster":true,"sentiment":{"negative":"__vue_devtool_undefined__","neutral":"__vue_devtool_undefined__","positive":"__vue_devtool_undefined__"}},
        {"id":"school-undefined","long":-6.76798,"lat":52.7381,"cluster":true,"sentiment":{"negative":"__vue_devtool_undefined__","neutral":"__vue_devtool_undefined__","positive":"__vue_devtool_undefined__"}},
        {"id":"school-undefined","long":-6.7318,"lat":52.803,"cluster":true,"sentiment":{"negative":"__vue_devtool_undefined__","neutral":"__vue_devtool_undefined__","positive":"__vue_devtool_undefined__"}},
        {"id":"school-undefined","long":-6.89544,"lat":52.795,"cluster":true,"sentiment":{"negative":"__vue_devtool_undefined__","neutral":"__vue_devtool_undefined__","positive":"__vue_devtool_undefined__"}},
        {"id":"school-undefined","long":-6.92377,"lat":52.8409,"cluster":true,"sentiment":{"negative":"__vue_devtool_undefined__","neutral":"__vue_devtool_undefined__","positive":"__vue_devtool_undefined__"}},
        {"id":"school-undefined","long":-6.85184,"lat":52.6771,"cluster":true,"sentiment":{"negative":"__vue_devtool_undefined__","neutral":"__vue_devtool_undefined__","positive":"__vue_devtool_undefined__"}},
        {"id":"school-undefined","long":-6.55546,"lat":52.863,"cluster":true,"sentiment":{"negative":"__vue_devtool_undefined__","neutral":"__vue_devtool_undefined__","positive":"__vue_devtool_undefined__"}},
        {"id":"school-undefined","long":-6.9072,"lat":52.5017,"cluster":true,"sentiment":{"negative":"__vue_devtool_undefined__","neutral":"__vue_devtool_undefined__","positive":"__vue_devtool_undefined__"}},
        {"id":"school-undefined","long":-6.9029,"lat":52.5463,"cluster":true,"sentiment":{"negative":"__vue_devtool_undefined__","neutral":"__vue_devtool_undefined__","positive":"__vue_devtool_undefined__"}},
        {"id":"school-undefined","long":-6.90043,"lat":52.4724,"cluster":true,"sentiment":{"negative":"__vue_devtool_undefined__","neutral":"__vue_devtool_undefined__","positive":"__vue_devtool_undefined__"}},
        {"id":"school-undefined","long":-6.86912,"lat":52.8307,"cluster":true,"sentiment":{"negative":"__vue_devtool_undefined__","neutral":"__vue_devtool_undefined__","positive":"__vue_devtool_undefined__"}},
        {"id":"school-undefined","long":-6.64791,"lat":52.696,"cluster":true,"sentiment":{"negative":"__vue_devtool_undefined__","neutral":"__vue_devtool_undefined__","positive":"__vue_devtool_undefined__"}},
        {"id":"school-undefined","long":-6.68951,"lat":52.8799,"cluster":true,"sentiment":{"negative":"__vue_devtool_undefined__","neutral":"__vue_devtool_undefined__","positive":"__vue_devtool_undefined__"}},
        {"id":"school-undefined","long":-6.61781,"lat":52.8915,"cluster":true,"sentiment":{"negative":"__vue_devtool_undefined__","neutral":"__vue_devtool_undefined__","positive":"__vue_devtool_undefined__"}},
        {"id":"school-undefined","long":-6.98213,"lat":52.7854,"cluster":true,"sentiment":{"negative":"__vue_devtool_undefined__","neutral":"__vue_devtool_undefined__","positive":"__vue_devtool_undefined__"}},
        {"id":"school-undefined","long":-6.91115,"lat":52.7485,"cluster":true,"sentiment":{"negative":"__vue_devtool_undefined__","neutral":"__vue_devtool_undefined__","positive":"__vue_devtool_undefined__"}},
        {"id":"school-undefined","long":-6.77921,"lat":52.6862,"cluster":true,"sentiment":{"negative":"__vue_devtool_undefined__","neutral":"__vue_devtool_undefined__","positive":"__vue_devtool_undefined__"}},
        {"id":"school-undefined","long":-6.70491,"lat":52.7559,"cluster":true,"sentiment":{"negative":"__vue_devtool_undefined__","neutral":"__vue_devtool_undefined__","positive":"__vue_devtool_undefined__"}},
        {"id":"school-undefined","long":-6.68477,"lat":52.6844,"cluster":true,"sentiment":{"negative":"__vue_devtool_undefined__","neutral":"__vue_devtool_undefined__","positive":"__vue_devtool_undefined__"}},
        {"id":"school-undefined","long":-6.96247,"lat":52.7012,"cluster":true,"sentiment":{"negative":"__vue_devtool_undefined__","neutral":"__vue_devtool_undefined__","positive":"__vue_devtool_undefined__"}},
        {"id":"school-undefined","long":-6.92205,"lat":52.8378,"cluster":true,"sentiment":{"negative":"__vue_devtool_undefined__","neutral":"__vue_devtool_undefined__","positive":"__vue_devtool_undefined__"}},
        {"id":"school-undefined","long":-6.92255,"lat":52.8386,"cluster":true,"sentiment":{"negative":"__vue_devtool_undefined__","neutral":"__vue_devtool_undefined__","positive":"__vue_devtool_undefined__"}},
        {"id":"school-undefined","long":-6.85962,"lat":52.571,"cluster":true,"sentiment":{"negative":"__vue_devtool_undefined__","neutral":"__vue_devtool_undefined__","positive":"__vue_devtool_undefined__"}},
        {"id":"school-undefined","long":-6.73378,"lat":52.8581,"cluster":true,"sentiment":{"negative":"__vue_devtool_undefined__","neutral":"__vue_devtool_undefined__","positive":"__vue_devtool_undefined__"}},
        {"id":"school-undefined","long":-6.93185,"lat":52.8265,"cluster":true,"sentiment":{"negative":"__vue_devtool_undefined__","neutral":"__vue_devtool_undefined__","positive":"__vue_devtool_undefined__"}},
        {"id":"school-undefined","long":-6.91224,"lat":52.836,"cluster":true,"sentiment":{"negative":"__vue_devtool_undefined__","neutral":"__vue_devtool_undefined__","positive":"__vue_devtool_undefined__"}},
        {"id":"school-undefined","long":-6.91185,"lat":52.8353,"cluster":true,"sentiment":{"negative":"__vue_devtool_undefined__","neutral":"__vue_devtool_undefined__","positive":"__vue_devtool_undefined__"}},
        {"id":"school-undefined","long":-6.971,"lat":52.735,"cluster":true,"sentiment":{"negative":"__vue_devtool_undefined__","neutral":"__vue_devtool_undefined__","positive":"__vue_devtool_undefined__"}},
        {"id":"school-undefined","long":-6.91096,"lat":52.8294,"cluster":true,"sentiment":{"negative":"__vue_devtool_undefined__","neutral":"__vue_devtool_undefined__","positive":"__vue_devtool_undefined__"}},
        {"id":"school-undefined","long":-6.94473,"lat":52.8373,"cluster":true,"sentiment":{"negative":"__vue_devtool_undefined__","neutral":"__vue_devtool_undefined__","positive":"__vue_devtool_undefined__"}},
        {"id":"school-undefined","long":-6.95219,"lat":52.8405,"cluster":true,"sentiment":{"negative":"__vue_devtool_undefined__","neutral":"__vue_devtool_undefined__","positive":"__vue_devtool_undefined__"}},
        {"id":"school-undefined","long":-7.32065,"lat":53.8595,"cluster":true,"sentiment":{"negative":"__vue_devtool_undefined__","neutral":"__vue_devtool_undefined__","positive":"__vue_devtool_undefined__"}},
        {"id":"school-undefined","long":-6.97357,"lat":53.9169,"cluster":true,"sentiment":{"negative":"__vue_devtool_undefined__","neutral":"__vue_devtool_undefined__","positive":"__vue_devtool_undefined__"}},
        {"id":"school-undefined","long":-7.79134,"lat":54.1183,"cluster":true,"sentiment":{"negative":"__vue_devtool_undefined__","neutral":"__vue_devtool_undefined__","positive":"__vue_devtool_undefined__"}},
        {"id":"school-undefined","long":-7.70495,"lat":54.1908,"cluster":true,"sentiment":{"negative":"__vue_devtool_undefined__","neutral":"__vue_devtool_undefined__","positive":"__vue_devtool_undefined__"}},
        {"id":"school-undefined","long":-7.32081,"lat":53.9652,"cluster":true,"sentiment":{"negative":"__vue_devtool_undefined__","neutral":"__vue_devtool_undefined__","positive":"__vue_devtool_undefined__"}},
        {"id":"school-undefined","long":-7.35615,"lat":53.9916,"cluster":true,"sentiment":{"negative":"__vue_devtool_undefined__","neutral":"__vue_devtool_undefined__","positive":"__vue_devtool_undefined__"}},
        {"id":"school-undefined","long":-7.47443,"lat":54.0642,"cluster":true,"sentiment":{"negative":"__vue_devtool_undefined__","neutral":"__vue_devtool_undefined__","positive":"__vue_devtool_undefined__"}},
        {"id":"school-undefined","long":-7.49642,"lat":53.9747,"cluster":true,"sentiment":{"negative":"__vue_devtool_undefined__","neutral":"__vue_devtool_undefined__","positive":"__vue_devtool_undefined__"}}];
    
    clusters = get_clusters(map_center_long, map_center_lat, map_height, map_width, max_clustering_distance, schools_list);
    console.log({clusters});
}

//test();
// test2();
