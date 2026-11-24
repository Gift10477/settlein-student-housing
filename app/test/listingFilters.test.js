import test from 'node:test';
import assert from 'node:assert/strict';
import { matchesListing } from '../src/services/listingFilters.js';
const property={title:'Sunrise Rooms',location:'Madaraka',type:'Hostel Room',price:12000,campus:'strathmore',gender_policy:'Female-only',furnishing_status:'Furnished',amenities:['Wi-Fi','CCTV'],verified:true};
test('gender and furnishing constrain results together',()=>{
 assert.equal(matchesListing(property,{gender_policy:'Female-only',furnishing_status:'Furnished'}),true);
 assert.equal(matchesListing(property,{gender_policy:'Male-only'}),false);
 assert.equal(matchesListing(property,{furnishing_status:'Unfurnished'}),false);
 assert.equal(matchesListing({...property,gender_policy:null},{gender_policy:'Mixed'}),false);
});
test('all selected amenities are required, for arrays and legacy storage',()=>{
 for(const amenities of [property.amenities,'Wi-Fi, CCTV','["Wi-Fi","CCTV"]']){
  assert.equal(matchesListing({...property,amenities},{amenities:['Wi-Fi','CCTV']}),true);
  assert.equal(matchesListing({...property,amenities},{amenities:['Wi-Fi','Gym']}),false);
 }
});
test('room type, search, price and clearing filters work together',()=>{
 assert.equal(matchesListing(property,{type:'Hostel Room',search:' madaraka ',maxPrice:15000}),true);
 assert.equal(matchesListing(property,{type:'Studio'}),false);
 assert.equal(matchesListing(property,{maxPrice:10000}),false);
 assert.equal(matchesListing(property,{search:'missing'}),false);
 assert.equal(matchesListing(property,{gender_policy:'all',furnishing_status:'all',amenities:[]}),true);
});
