import * as React from 'react';
import {useState} from 'react';
import { Path } from '@progress/kendo-drawing';
import { Map, MapLayers, MapShapeLayer, MapTileLayer, MapMarkerLayer } from '@progress/kendo-react-map';
import { AutoComplete } from "@progress/kendo-react-dropdowns";
import { Button } from '@progress/kendo-react-buttons';
import logo from './logo.png';


const initialMarkers = [
  { location: [24.4539, 54.3773], title: "Abu Dhabi City Center" },
  { location: [24.4667, 54.3667], title: "Sheikh Zayed Grand Mosque" },
  { location: [24.4249, 54.4337], title: "Abu Dhabi Corniche" },
  { location: [24.5107, 54.3761], title: "Ferrari World Abu Dhabi" },
  { location: [24.4113, 54.4751], title: "Yas Marina Circuit" }
];

const markersWithPointTo = initialMarkers.map((marker, index, array) => ({
  ...marker,
  pointTo: index !== array.length - 1 ? array[index + 1].location : []
}));

const linkMarker = (map, marker) => {
  const data = marker.dataItem;
  if (data.pointTo) {
    const from = map.locationToView(marker.location());
    const to = map.locationToView(data.pointTo);

    const layer = map.layers[1];
    const line = new Path({
      stroke: {
        color: "#fcc",
        width: 6,
        lineCap: 'round'
      }
    });
    line.moveTo(from).lineTo(to);
    layer.surface.draw(line);
  }
};

const reset = args => {
  const map = args.target;
  const layer = map.layers[2];
  for (let marker of layer.items) {
    linkMarker(map, marker);
  }
};

const cities = ["Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Umm Al-Quwain", "Fujairah", "Ras Al Khaimah"];

const disasters = ["Fire","War","Earthquake"];


const App = () => {
  const center = [24.4539, 54.3773];
  const [zoom,setZoom] = useState(20);
  const tileSubdomains = ['a', 'b', 'c'];
  const tileUrl = e => `https://${e.subdomain}.tile.openstreetmap.org/${e.zoom}/${e.x}/${e.y}.png`;
  const attribution = '&copy; <a href="https://osm.org/copyright">OpenStreetMap contributors</a>';
  return <div style={{ background:"#E7ECEF",display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'scroll' }}>
  <div style={{ width: '100%', borderBottom: '1px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
     <img src={logo} alt="Logo" style={{ height: '150px',marginTop:'100px', marginRight: '20px', display: 'block', margin: '0 auto' }} />
   </div>

   <div style={{ width: '1000px', borderRadius: '10px', overflow: 'hidden', marginTop: '20px' }}>
     
   <div style={{ display: 'flex', alignItems: 'center' }}>
     <div style={{ flexGrow: 1 }}>
       <AutoComplete
         data={cities}
         placeholder="Select a city"
         style={{ width: '200px', marginTop: '20px', marginBottom: '20px', border:"solid #114B5F" }}
         onChange={(e)=>{if(e.value==="Abu Dhabi")setZoom(12)}}
       />
       <AutoComplete
         data={disasters}
         placeholder="Select a disaster"
         style={{ width: '200px', margin: '20px', border:"solid #114B5F" }}
       />
     </div>
     <Button primary={true} style={{ borderRadius: '5px', marginLeft: '20px', background:"#114B5F", color:"white" }}>Generate evacuation</Button>
   </div>

   <Map center={center} zoom={zoom} onReset={reset} style={{ border: '1px solid #ccc', borderRadius: '15px' }}>
     <MapLayers>
       <MapTileLayer urlTemplate={tileUrl} subdomains={tileSubdomains} attribution={attribution} style={{ border: '1px solid #ccc', borderRadius: '5px' }} />
       <MapShapeLayer style={{ border: '1px solid #ccc', borderRadius: '5px' }} />
       <MapMarkerLayer data={markersWithPointTo} locationField="location" titleField="title" style={{ border: '1px solid #ccc', borderRadius: '5px' }} />
     </MapLayers>
   </Map>


     <div style={{ borderBottom: '1px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
       <Button primary={true} style={{ borderRadius: '5px', marginTop: '20px', marginBottom: '20px', background: "#114B5F", color: "white" }}>Generate pdf</Button>
     </div>
   </div>
 </div>

}
;

export default App;
