import options from '../../../../shared/listingOptions.json';
export default function AmenityPicker({ value = [], onChange }) {
  return <fieldset style={{gridColumn:'1 / -1',padding:'16px',border:'1px solid #b9cec4',borderRadius:'8px'}}>
    <legend>Available amenities</legend>
    <div style={{display:'flex',flexWrap:'wrap',gap:'16px'}}>{options.amenities.map(amenity => <label key={amenity} style={{display:'flex',alignItems:'center',gap:'8px'}}>
      <input type="checkbox" style={{width:'auto',margin:0}} checked={value.includes(amenity)} onChange={event => onChange(event.target.checked ? [...value, amenity] : value.filter(item => item !== amenity))}/>{amenity}
    </label>)}</div>
  </fieldset>;
}
