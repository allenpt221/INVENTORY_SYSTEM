import axios from "axios";
import FormData from "form-data";

async function removeBackgroundFromImage(base64Image: string): Promise<string> {
  const formData = new FormData();
  formData.append("image_file_b64", base64Image.replace(/^data:image\/\w+;base64,/, ""));
  formData.append("size", "auto");

  const response = await axios.post("https://api.remove.bg/v1.0/removebg", formData, {
    headers: {
      ...formData.getHeaders(),
      "X-Api-Key": process.env.REMOVE_BG_API_KEY , // Replace with your actual API key
    },
    responseType: "arraybuffer",
  });

  const base64Result = Buffer.from(response.data).toString("base64");
  return `data:image/png;base64,${base64Result}`;
}

export default removeBackgroundFromImage;