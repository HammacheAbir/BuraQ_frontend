"use client";
import { useMemo, useRef, useState } from "react";
import SectionTitle from "../Common/SectionTitle";
import { Path } from '@progress/kendo-drawing';
import { Map,   MapBubbleLayer,
  MapBubbleLayerTooltip,MapLayers, MapShapeLayer, MapTileLayer, MapMarkerLayer } from '@progress/kendo-react-map';
import { AutoComplete } from "@progress/kendo-react-dropdowns";
import { Button, DropDownButton } from '@progress/kendo-react-buttons';
import { globeIcon, warningCircleIcon } from "@progress/kendo-svg-icons";
import '@progress/kendo-theme-default/dist/all.css'
import coordinatesData from './coordinates.json';
import customMarkerIcon from './point.svg'; 
import { PDFExport, savePDF } from "@progress/kendo-react-pdf";


const safePoints = Object.fromEntries(
  Object.entries(coordinatesData).filter(([key, value]) => value.is_safe.includes("yes"))
);

const bubbles = Object.entries(safePoints).map(([key, value]) => {
  const [longitude,latitude] = value.coordinates[0];
  return { location: [latitude, longitude], title: `Marker ${key}` };
});

const bubbleStyle = {
  fill: {
    color: "orange",
    opacity: 0.5,
  },
  stroke: {
    width: 1,
    color: "black",
  },
};
const renderBubbleTooltip = (props) => (
  <span>
    {props.dataItem.City} ({props.dataItem.Country}): {props.value}
  </span>
);

const linkMarker = (map, marker) => {
  const data = marker.dataItem;
  if (data.pointTo) {
    const from = map.locationToView(marker.location());
    const to = map.locationToView(data.pointTo);

    const layer = map.layers[1];
    const line = new Path({
      stroke: {
        color: "green", // Line color
        width: 2,
        lineCap: 'round'
      }
    });

    // Calculate the angle of the line
    const angle = Math.atan2(to.y - from.y, to.x - from.x);

    // Length of the arrowhead
    const arrowLength = 20;

    // Coordinates of the arrowhead
    const arrowX = to.x - arrowLength * Math.cos(angle);
    const arrowY = to.y - arrowLength * Math.sin(angle);

    // Draw the line
    line.moveTo(from).lineTo(to);

    // Draw the arrowhead
    const arrowhead = new Path({
      fill: {
        color: "green" // Arrow color
      },
      stroke: null
    });
    arrowhead.moveTo(to)
             .lineTo(arrowX + arrowLength * Math.cos(angle - Math.PI / 6), arrowY + arrowLength * Math.sin(angle - Math.PI / 6))
             .lineTo(arrowX + arrowLength * Math.cos(angle + Math.PI / 6), arrowY + arrowLength * Math.sin(angle + Math.PI / 6))
             .close();

    // Draw the line and arrowhead on the map
    if(to.y < 1000){
        layer.surface.draw(line);
        layer.surface.draw(arrowhead);
    }
  }
};


const cities = ["Gaza City",
"Rafah",
"Khan Yunis",
"Jabalia",
"Beit Hanoun",
"Deir al-Balah",
"Beit Lahiya",
"Al-Bureij",
"Nuseirat",
"Maghazi"];

const disasters = ["Fire","War","Earthquake"];


const DemoComp = () => {

  const container = useRef(null);
  const pdfExportComponent = useRef(null);
  const exportPDFWithMethod = () => {
    let element = container.current || document.body;
    savePDF(element, {
      paperSize: "auto",
      margin: 40,
      fileName: `Report for ${new Date().getFullYear()}`,
    });
  };
  const exportPDFWithComponent = () => {
    if (pdfExportComponent.current) {
      pdfExportComponent.current.save();
    }
  };


  const [generating, setGenerating] = useState(false)
  const [selectedCity, setSelectedCity] = useState("")
  const [selectedDisaster, setSelectedDisaster] = useState("")
  const [clickedMarker,setClickedMarker] = useState(null)

  const mapComponent =  useMemo(()=>{
    const initialMarkers = clickedMarker==null?Object.entries(coordinatesData).map(([key, value]) => {
          const [longitude,latitude] = value.coordinates[0];
          return { location: [latitude, longitude], title: `Marker ${key}` };
    }):Object.entries({"12": {"coordinates": [[34.23520053749999, 31.3115429875], [34.2373931625, 31.3144839125], [34.24312005, 31.315404649999998], [34.24279465, 31.312575600000002], [34.24664895, 31.3115423]], "is_safe": "no, get out please!"}, "10": {"coordinates": [[34.23627195, 31.3094375], [34.23520053749999, 31.3115429875], [34.2373931625, 31.3144839125], [34.24312005, 31.315404649999998], [34.24279465, 31.312575600000002], [34.24664895, 31.3115423]], "is_safe": "no, get out please!"}, "20": {"coordinates": [[34.23908245, 31.3124631], [34.23520053749999, 31.3115429875], [34.2373931625, 31.3144839125], [34.24312005, 31.315404649999998], [34.24279465, 31.312575600000002], [34.24664895, 31.3115423]], "is_safe": "no, get out please!"}, "27": {"coordinates": [[34.2339202, 31.3133209], [34.23520053749999, 31.3115429875], [34.2373931625, 31.3144839125], [34.24312005, 31.315404649999998], [34.24279465, 31.312575600000002], [34.24664895, 31.3115423]], "is_safe": "no, get out please!"}}).map(([key, value]) => {
      const [longitude,latitude] = value.coordinates[0];
      return { location: [latitude, longitude], title: `Marker ${key}` };
})

    const markersWithPointTo = initialMarkers?.map((marker, index, array) => {
      if(index !== array.length - 1)return {
      ...marker,
      shape:"circle",
      pointTo: index !== array.length - 1 ? array[index + 1]?.location : []}
    });

    const zoom = 14;
    const center = selectedCity==="Rafah"?[31.2870, 34.2592]:[24.4539, 54.3773]
    const tileSubdomains = ['a', 'b', 'c'];
    const tileUrl = e => {
      return `https://${e.subdomain}.tile.openstreetmap.org/${e.zoom}/${e.x}/${e.y}.png`
    };
    const attribution = '&copy; <a href="https://osm.org/copyright">OpenStreetMap contributors</a>';

    const reset = args => {
      setTimeout(()=>{
        const map = args.target;
        const layer = map.layers[2];
        for (let marker of layer.items) {
          linkMarker(map, marker);
        }
      },500)
    };

    const bubbles = Object.entries(safePoints).map(([key, value]) => {
      const [longitude,latitude] = value.coordinates[0];
      return { location: [latitude, longitude], value: 1 };
    });
    const bubbleStyle = {
      fill: {
        color: "green",
      },
    };

    if(!generating){
      return <Map onReset={reset} center={center} zoom={zoom} style={{ border: '1px solid #ccc', borderRadius: '15px' }}>
      <MapLayers>
        <MapTileLayer urlTemplate={tileUrl} subdomains={tileSubdomains} attribution={attribution} style={{ border: '1px solid #ccc', borderRadius: '5px' }} />
        <MapBubbleLayer
          data={bubbles}
          locationField="location"
          valueField="value"
          style={bubbleStyle}
          zIndex={1}
        />
        <MapShapeLayer zIndex={2} style={{ border: '1px solid #ccc', borderRadius: '5px' }} />
        <MapMarkerLayer data={markersWithPointTo} locationField="location" titleField="title" style={{ border: '1px solid #ccc', borderRadius: '5px' }} />
      </MapLayers>
    </Map>
    }else{
      return <Map onMarkerClick={(e)=>setClickedMarker(e.marker.dataItem.location)} onReset={reset} center={center} zoom={zoom} style={{ border: '1px solid #ccc', borderRadius: '15px' }}>
      <MapLayers>
      <MapBubbleLayer
          data={bubbles}
          locationField="location"
          valueField="value"
          style={bubbleStyle}
          zIndex={1}
        />
      </MapLayers>
      <MapLayers>
        <MapTileLayer urlTemplate={tileUrl} subdomains={tileSubdomains} attribution={attribution} style={{ border: '1px solid #ccc', borderRadius: '5px' }} />
        {/* <MapBubbleLayer
          data={bubbles}
          locationField="location"
          valueField="value"
          style={bubbleStyle}
          zIndex={1}
        /> */}
        <MapShapeLayer style={{ border: '1px solid #ccc', borderRadius: '5px' }} />
        <MapMarkerLayer data={markersWithPointTo} locationField="location" titleField="title" style={{ border: '1px solid #ccc', borderRadius: '5px' }} />
      </MapLayers>
    </Map>
    }

  },[selectedCity,generating,clickedMarker])


  return (
    <section className="relative z-10 py-16 md:py-20 lg:py-28">
      <div className="container">
        <SectionTitle
          title="We are ready to help"
          paragraph="There are many variations of passages of Lorem Ipsum available but the majority have suffered alteration in some form."
          center
          mb="80px"
        />

      </div>

      <div style={{ padding:"100px" }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ flexGrow: 1, height:"100px" }}>
            <DropDownButton 
              text={selectedCity!=""?selectedCity:"Select a city"}
              items={cities} 
              svgIcon={globeIcon}
              style={{ padding:"10px",height:"40px",width: '200px', marginTop: '20px', marginBottom: '20px', border:"solid #114B5F" }}
              onItemClick={(e)=>setSelectedCity(e.item)}
            />
            <DropDownButton 
              text={ selectedDisaster!=""?selectedDisaster:"Select a disaster" }
              items={disasters} 
              svgIcon={warningCircleIcon}
              style={{ padding:"10px",height:"40px",width: '200px', marginTop: '20px', marginBottom: '20px', border:"solid #114B5F" }}
              onItemClick={(e)=>console.log(e.item)}
            />
          </div>
          <div style={{ height:"50px" }}>
            <Button onClick={()=>setGenerating(true)} primary={true} style={{ height:"40px",borderRadius: '5px', marginLeft: '20px', background:"#4a6cf7cd", color:"white" }}>Generate evacuation</Button>
          </div>
        </div>

        <PDFExport
          ref={pdfExportComponent}
          paperSize="auto"
          margin={40}
          fileName={`Map for ${selectedCity} evacuation`}
          author="KendoReact Team"
        >
          <div ref={container}>
            {mapComponent}
          </div>
        </PDFExport>

        
        <div style={{ borderBottom: '1px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Button onClick={exportPDFWithMethod} primary={true} style={{ height:"40px",borderRadius: '5px', marginTop: '20px', marginBottom: '20px', background: "#4a6cf7cd", color: "white" }}>Generate pdf</Button>
        </div> 
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-[-1] h-full w-full bg-[url(/images/video/shape.svg)] bg-cover bg-center bg-no-repeat"></div>
    </section>
  );
};

export default DemoComp;
