import { Streamlit, RenderData } from "streamlit-component-lib"

const labelDiv = document.body.appendChild(document.createElement("label"))
const container = document.body.appendChild(document.createElement("div"))
container.classList.add("container")

/**
 * The component's render function. This will be called immediately after
 * the component is initially loaded, and then again every time the
 * component gets new data from Python.
 */
function onRender(event: Event): void {
  // Get the RenderData from the event
  const data = (event as CustomEvent<RenderData>).detail

  if (data.theme) {
    labelDiv.style.font = data.theme.font
    labelDiv.style.color = data.theme.textColor
    if (data.theme.base === "dark") {
      document.body.querySelectorAll(".image-box, .caption").forEach((el) => {
        el.classList.add("dark")
      })
    } else {
      document.body.querySelectorAll(".image-box, .caption").forEach((el) => {
        el.classList.remove("dark")
      })
    }
  }

  // Set the label HTML content
  labelDiv.innerHTML = data.args["label"]

  let images = data.args["images"]
  let imagesRows = data.args["images_rows"]
  console.log("Received data:", data)  // Log the entire data object

  // Clear container for re-rendering
  container.innerHTML = ""

  const renderImageRow = (row: any, rowIndex: number) => {
    const rowContainer = container.appendChild(document.createElement("div"))
    rowContainer.classList.add("image-row")  // Add CSS class for row styling
    rowContainer.style.display = "flex"  // Flexbox for horizontal layout
    rowContainer.style.flexWrap = "wrap" // Wrap if necessary

    row.images.forEach((image: string, i: number) => {
      let item = rowContainer.appendChild(document.createElement("div"))
      item.classList.add("item")
      item.style.margin = "0.5rem" // Adjust margin between images
      item.style.flex = "1 1 auto" // Flex-grow to handle container width

      let box = item.appendChild(document.createElement("div"))
      box.classList.add("image-box")

      // Ensure the image is a string before setting it as src
      if (typeof image === "string") {
        let img = box.appendChild(document.createElement("img"))
        img.classList.add("image")
        img.src = image

        if (row.captions && row.captions[i]) {
          let caption = item.appendChild(document.createElement("div"))
          caption.classList.add("caption")
          caption.innerHTML = row.captions[i]
        }

        if (rowIndex === data.args["selected_row_index"] && i === data.args["index"]) {
          box.classList.add("selected")
          img.classList.add("selected")
        }

        img.onclick = function () {
          if (!data.args["disabled"]) {  // Ensure click only works when not disabled
            container.querySelectorAll(".selected").forEach((el) => {
              el.classList.remove("selected")
            })
            Streamlit.setComponentValue({ rowIndex, index: i })
            box.classList.add("selected")
            img.classList.add("selected")
          }
        }
      } else {
        console.error("Invalid image format: ", image)
      }
    })
  }

  if (images) {
    images.forEach((row: any, rowIndex: number) => {
      renderImageRow(row, rowIndex)
    })
  } else if (imagesRows) {
    imagesRows.forEach((row: any, rowIndex: number) => {
      renderImageRow(row, rowIndex)
    })
  }

  // Apply the disabled state if data.args["disabled"] is true
  if (data.args["disabled"]) {
    container.classList.add("disabled")
  } else {
    container.classList.remove("disabled")
  }

  // We tell Streamlit to update our frameHeight after each render event, in
  // case it has changed. (This isn't strictly necessary for the example
  // because our height stays fixed, but this is a low-cost function, so
  // there's no harm in doing it redundantly.)
  Streamlit.setFrameHeight()
}

// Attach our `onRender` handler to Streamlit's render event.
Streamlit.events.addEventListener(Streamlit.RENDER_EVENT, onRender)

// Tell Streamlit we're ready to start receiving data. We won't get our
// first RENDER_EVENT until we call this function.
Streamlit.setComponentReady()

// Finally, tell Streamlit to update our initial height. We omit the
// `height` parameter here to have it default to our scrollHeight.
Streamlit.setFrameHeight()
