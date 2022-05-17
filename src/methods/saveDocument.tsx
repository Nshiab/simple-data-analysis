import React from "react"
import ReactDOMServer from 'react-dom/server';
import getExtension from "../helpers/getExtension.js"
import fs from "fs"
import log from "../helpers/log.js"


function renderFullPage(html: string) {
  return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>My page</title>
          <meta name="viewport" content="initial-scale=1, width=device-width" />
          <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
        </head>
        <body>
          <div id="root">${html}</div>
        </body>
      </html>
    `;
}

function renderReactComponent(html: string) {

  return `import React from "react"

  export default function Analysis() {
    return <div>${html}</div>
  }`
}


export default async function saveDocument(components: any[], path: string) {

  const extension = getExtension(path)
  if (!["html", "js"].includes(extension)) {
    throw new Error("Your analysis must be saved into an html or js file.")
  }

  const html = ReactDOMServer.renderToString(
    <div>
      {...components}
    </div>
  )

  if (extension === "html") {
    fs.writeFileSync(path, renderFullPage(html))
  } else if (extension === "js") {
    fs.writeFileSync(path, renderReactComponent(html))
  }

  log(`=> Document saved to ${path}`, "blue")
}