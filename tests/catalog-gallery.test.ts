import test from "node:test";
import assert from "node:assert/strict";
import {galleryFromForm} from "../src/lib/catalog-images";
const form=(cover:string,gallery:string)=>{const f=new FormData();f.set("image",cover);f.set("galleryUrls",gallery);return f;};
test("Cloudinary gallery uses real newline-separated URLs and preserves the cover first",()=>{
 const cover="https://res.cloudinary.com/example/image/upload/cover.jpg";
 const one="https://res.cloudinary.com/example/image/upload/back.jpg";
 const two="https://res.cloudinary.com/example/image/upload/nutrition.jpg";
 assert.deepEqual(galleryFromForm(form(cover,one+"\n"+two)),[cover,one,two]);
 assert.deepEqual(galleryFromForm(form(cover,one+"\r\n"+two)),[cover,one,two]);
});
test("gallery deduplicates an image already used as the cover",()=>{
 const cover="https://res.cloudinary.com/example/image/upload/cover.jpg";
 assert.deepEqual(galleryFromForm(form(cover,cover+"\n"+cover)),[cover]);
});
test("gallery rejects an unsafe URL and more than seven additional images",()=>{
 assert.throws(()=>galleryFromForm(form("https://example.com/photo.jpg","javascript:alert(1)")),/Image/);
 assert.throws(()=>galleryFromForm(form("https://example.com/photo.jpg",Array.from({length:8},(_,i)=>"https://example.com/"+i+".jpg").join("\n"))),/Maximum 8/);
});
