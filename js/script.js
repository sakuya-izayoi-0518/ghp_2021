let emergency_flg = false;
var marker_list = [];
var polygon_list;

function clickSetting() {
    let header = document.getElementById("header");
    let title = document.getElementById("title");
    let map_change = document.getElementById("map-change");
    let map_change_icon = document.getElementById("map-change-icon");
    let bottom_menu = document.getElementById("bottom-menu");
    if (emergency_flg) {
        title.innerText = "観光マップ";
        map_change.innerText = "避難マップ";
        map_change_icon.src = "./data/避難所.svg";
        map_change_icon.style = "margin-bottom: 8px; background-color: white;";
        header.style.backgroundColor = "#34675C";
        bottom_menu.style.backgroundColor = "#34675C";
        map.removeLayer(osm);
        removeMarker();
        removePolygon();
        gsi.addTo(map);
        emergency_flg = false;
    } else {
        title.innerText = "避難マップ";
        map_change.innerText = "観光マップ";
        map_change_icon.src = "./img/sightseeing_bag.png";
        map_change_icon.style = "margin-bottom: 8px; background-color: #ff4500;";
        header.style.backgroundColor = "#ff4500";
        bottom_menu.style.backgroundColor = "#ff4500";
        osm.addTo(map);
        emergency_flg = true;
        addRockfallData();
        addShelterData();
    }
}

// --- 2022/2/20 add 観光マップ
var kankoMap = null;
function clickKankoMap(){
    // 既にある場合は削除
    if ( kankoMap != null ){
        map.removeLayer(kankoMap);
        kankoMap = null;
        return;
    }
    var geotiff_map = "./data/out.tif";
    fetch(geotiff_map)
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => {
        parseGeoraster(arrayBuffer).then(georaster => {
        //   console.log("georaster:", georaster);
          kankoMap = new GeoRasterLayer({
              attribution: "Planet",
              opacity: 0.7,
              georaster: georaster,
              resolution: 128
          });
          kankoMap.addTo(map);
          map.fitBounds(kankoMap.getBounds());
      })
    });
    alert("観光マップを表示中です。しばらくお待ちください。");
}
// --- 2022/2/20

// 避難所データ
function addShelterData(){
    $.getJSON("./data/避難施設データ_曽於市.geojson", function(data) {
        var geojson = L.geoJson(data, {
            onEachFeature: function (feature, layer) {
                var lat = feature.properties.fY;
                var lng = feature.properties.fX;
                var marker = L.marker([lat,lng], {icon: shelterIcon}).addTo(map);
                marker.bindPopup(feature.properties.col0);
                marker_list.push(marker);
            }
        });
        geojson.addTo(map);
    });
}

// 急傾斜地崩壊危険区域データ
function addRockfallData(){
    $.getJSON("./data/急傾斜地崩壊危険区域データ_鹿児島県_R2_曽於市.geojson", function(data) {
        var geojson = L.geoJson(data, {
            onEachFeature: function (feature, layer) {
                var polygon = turf.polygon(feature.geometry.coordinates[0]);
                var centroid = turf.centroid(polygon);
                var lat = centroid.geometry.coordinates[1].toFixed(6);
                var lng = centroid.geometry.coordinates[0].toFixed(6);
                var marker = L.marker([lat,lng], {icon: rockfallIcon}).addTo(map);
                marker.bindPopup(feature.properties.A47_004);
                marker_list.push(marker);
            },
            style: hazardAreaStyle
        });
        geojson.addTo(map);
        polygon_list = geojson;
    });
}

function removeMarker(){
    let num = marker_list.length;
    for(let i = 0; i < num; i++) {
        map.removeLayer(marker_list[i]);
    }
    marker_list = [];
}

function removePolygon(){
    map.removeLayer(polygon_list);
    polygon_list = null;
}
