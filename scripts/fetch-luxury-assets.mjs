import fs from "fs";
import path from "path";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: "web8vmww",
  api_key: "898349595447971",
  api_secret: "IGju5tzebtnACCVN5HlShNnDwao",
  secure: true,
});

const IMAGES_TO_FETCH = [
  {
    localPath: "public/images/hero/hero_resort.jpg",
    folder: "hotel/hotel-profile",
    publicId: "hero_luxury_resort",
    url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=85",
  },
  {
    localPath: "public/images/rooms/penthouse_bedroom.jpg",
    folder: "hotel/rooms/presidential-penthouse/cover",
    publicId: "penthouse_bedroom_master",
    url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1400&q=85",
  },
  {
    localPath: "public/images/rooms/penthouse_living.jpg",
    folder: "hotel/rooms/presidential-penthouse/room",
    publicId: "penthouse_living_lounge",
    url: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1400&q=85",
  },
  {
    localPath: "public/images/washrooms/penthouse_washroom.jpg",
    folder: "hotel/rooms/presidential-penthouse/washroom",
    publicId: "penthouse_marble_bath",
    url: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=1400&q=85",
  },
  {
    localPath: "public/images/toilets/penthouse_toilet.jpg",
    folder: "hotel/rooms/presidential-penthouse/toilet",
    publicId: "penthouse_toilet_suite",
    url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1400&q=85",
  },
  {
    localPath: "public/images/rooms/deluxe_bedroom.jpg",
    folder: "hotel/rooms/deluxe-executive/cover",
    publicId: "deluxe_executive_bedroom",
    url: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1400&q=85",
  },
  {
    localPath: "public/images/washrooms/deluxe_washroom.jpg",
    folder: "hotel/rooms/deluxe-executive/washroom",
    publicId: "deluxe_executive_shower",
    url: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1400&q=85",
  },
  {
    localPath: "public/images/toilets/deluxe_toilet.jpg",
    folder: "hotel/rooms/deluxe-executive/toilet",
    publicId: "deluxe_toilet_suite",
    url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1400&q=85",
  },
  {
    localPath: "public/images/rooms/heritage_bedroom.jpg",
    folder: "hotel/rooms/classic-heritage/cover",
    publicId: "heritage_classic_bedroom",
    url: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1400&q=85",
  },
  {
    localPath: "public/images/washrooms/heritage_washroom.jpg",
    folder: "hotel/rooms/classic-heritage/washroom",
    publicId: "heritage_classic_washroom",
    url: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=1400&q=85",
  },
  {
    localPath: "public/images/rooms/family_villa.jpg",
    folder: "hotel/rooms/family-villa/cover",
    publicId: "family_villa_bedroom",
    url: "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1400&q=85",
  },
  {
    localPath: "public/images/rooms/twin_haven.jpg",
    folder: "hotel/rooms/twin-haven/cover",
    publicId: "twin_haven_bedroom",
    url: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1400&q=85",
  },
  {
    localPath: "public/images/amenities/infinity_pool.jpg",
    folder: "hotel/amenities",
    publicId: "resort_infinity_pool",
    url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1400&q=85",
  },
  {
    localPath: "public/images/amenities/dining_sanctuary.jpg",
    folder: "hotel/amenities",
    publicId: "resort_fine_dining",
    url: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1400&q=85",
  },
];

async function run() {
  console.log("Starting high-resolution asset acquisition and Cloudinary upload...");

  const results = {};

  for (const item of IMAGES_TO_FETCH) {
    try {
      console.log(`Processing: ${item.publicId}...`);
      const res = await fetch(item.url);
      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Save locally to public folder
      const dir = path.dirname(item.localPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(item.localPath, buffer);
      console.log(`  ✓ Saved locally to ${item.localPath}`);

      // Upload to user's Cloudinary account
      const base64Data = `data:image/jpeg;base64,${buffer.toString("base64")}`;
      const uploadRes = await cloudinary.uploader.upload(base64Data, {
        folder: item.folder,
        public_id: item.publicId,
        overwrite: true,
        resource_type: "image",
      });

      console.log(`  ✓ Uploaded to Cloudinary: ${uploadRes.secure_url}`);
      results[item.publicId] = {
        secureUrl: uploadRes.secure_url,
        localPath: `/${item.localPath.replace(/^public\//, "")}`,
        publicId: uploadRes.public_id,
        width: uploadRes.width,
        height: uploadRes.height,
      };
    } catch (err) {
      console.error(`  ✗ Error processing ${item.publicId}:`, err.message);
      results[item.publicId] = {
        secureUrl: item.url,
        localPath: `/${item.localPath.replace(/^public\//, "")}`,
        publicId: item.publicId,
      };
    }
  }

  // Save the manifest
  fs.writeFileSync("src/config/mediaManifest.json", JSON.stringify(results, null, 2));
  console.log("\nComplete! Media manifest written to src/config/mediaManifest.json");
}

run();
