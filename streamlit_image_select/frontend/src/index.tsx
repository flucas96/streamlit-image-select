import { Streamlit, RenderData } from "streamlit-component-lib"

const labelDiv = document.body.appendChild(document.createElement("label"))
const container = document.body.appendChild(document.createElement("div"))
container.classList.add("container")

function onRender(event: Event): void {
  // Get the RenderData from the event
  const data = (event as CustomEvent<RenderData>).detail

  // Apply custom CSS if provided
  if (data.args["custom_css"]) {
    let styleElement = document.getElementById("custom-style");
    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = "custom-style";
      document.head.appendChild(styleElement);
    }
    styleElement.textContent = data.args["custom_css"];
  }

  if (data.theme) {
    labelDiv.style.font = data.theme.font;
    labelDiv.style.color = data.theme.textColor;
    if (data.theme.base === "dark") {
      document.body.querySelectorAll(".image-box, .caption").forEach((el) => {
        el.classList.add("dark");
      });
    } else {
      document.body.querySelectorAll(".image-box, .caption").forEach((el) => {
        el.classList.remove("dark");
      });
    }
  }

  // Set the label HTML content
  labelDiv.innerHTML = data.args["label"];

  let images = data.args["images"];
  let imagesRows = data.args["images_rows"];
  let index = data.args["index"];

  // Declare selectedIndex and selectedRowIndex outside of the if block
  let selectedIndex: number = -1;
  let selectedRowIndex: number = -1;

  if (index !== undefined) {
    selectedIndex = index["index"];
    selectedRowIndex = index["rowIndex"];
  }

  // Clear container for re-rendering
  container.innerHTML = "";

  const renderImageRow = (row: any, rowIndex: number) => {
    // Create a container for the row and the vertical label
    const rowWrapper = container.appendChild(document.createElement("div"));
    rowWrapper.classList.add("row-wrapper");
    rowWrapper.style.display = "flex";
    rowWrapper.style.alignItems = "center";
    rowWrapper.style.marginBottom = "1rem";

    // Add the vertical label if provided
    if (row.vertical_label) {
      const verticalLabel = rowWrapper.appendChild(document.createElement("div"));
      verticalLabel.classList.add("vertical-label");
      verticalLabel.innerHTML = row.vertical_label;
      verticalLabel.style.marginRight = "1rem";
      verticalLabel.style.writingMode = "vertical-rl";
      verticalLabel.style.textAlign = "center";
      verticalLabel.style.transform = "rotate(180deg)"; // Rotate the label 180 degrees

    }

    const rowContainer = rowWrapper.appendChild(document.createElement("div"));
    rowContainer.classList.add("image-row");  // Add CSS class for row styling
    rowContainer.style.display = "flex";  // Flexbox for horizontal layout
    rowContainer.style.flexWrap = "nowrap"; // Prevent wrapping
    rowContainer.style.gap = "1rem"; // Set gap between images

    row.images.forEach((image: string, i: number) => {
      let item = rowContainer.appendChild(document.createElement("div"));
      item.classList.add("item");
      item.style.flex = "0 0 auto"; // Prevent flex-grow
      item.style.width = "10rem"; // Fixed width of 10rem
      item.style.boxSizing = "border-box"; // Include padding and border in the element's width and height

      let box = item.appendChild(document.createElement("div"));
      box.classList.add("image-box");

      // Ensure the image is a string before setting it as src
      if (typeof image === "string") {
        let img = box.appendChild(document.createElement("img"));
        img.classList.add("image");
        img.src = image;

        // Set the tooltip if provided
        if (row.tooltip && row.tooltip[i]) {
          img.title = row.tooltip[i];
        }

        if (row.captions && row.captions[i]) {
          let caption = item.appendChild(document.createElement("div"));
          caption.classList.add("caption");
          caption.innerHTML = row.captions[i];
        }

        // Check if this image should be selected by default
        if (rowIndex === selectedRowIndex && i === selectedIndex) {
          box.classList.add("selected");
          img.classList.add("selected");
        }

        img.onclick = function () {
          if (!data.args["disabled"]) {  // Ensure click only works when not disabled
            container.querySelectorAll(".selected").forEach((el) => {
              el.classList.remove("selected");
            });
            Streamlit.setComponentValue({ rowIndex, index: i });
            box.classList.add("selected");
            img.classList.add("selected");
          }
        };
      } else {
        console.error("Invalid image format: ", image);
      }
    });
  };

  if (images) {
    images.forEach((row: any, rowIndex: number) => {
      renderImageRow(row, rowIndex);
    });
  } else if (imagesRows) {
    imagesRows.forEach((row: any, rowIndex: number) => {
      renderImageRow(row, rowIndex);
    });
  }

  // Apply the disabled state if data.args["disabled"] is true
  if (data.args["disabled"]) {
    container.classList.add("disabled");
  } else {
    container.classList.remove("disabled");
  }

  // We tell Streamlit to update our frameHeight after each render event, in
  // case it has changed. (This isn't strictly necessary for the example
  // because our height stays fixed, but this is a low-cost function, so
  // there's no harm in doing it redundantly.)
  Streamlit.setFrameHeight();
}

// Attach our `onRender` handler to Streamlit's render event.
Streamlit.events.addEventListener(Streamlit.RENDER_EVENT, onRender);

// Tell Streamlit we're ready to start receiving data. We won't get our
// first RENDER_EVENT until we call this function.
Streamlit.setComponentReady();

// Finally, tell Streamlit to update our initial height. We omit the
// `height` parameter here to have it default to our scrollHeight.
Streamlit.setFrameHeight();
