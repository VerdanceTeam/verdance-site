
# Verdance Website

This repo is for the Verdance marketing site found at [verdance.co](https://www.verdance.co/).




## Installation

Copy this repo locally

```bash
git clone verdance-site
cd verdance-site
```

Then install our incredibly small set of site dependencies:

```bash
npm install
```
## Run Locally

Once all your dependencies are installed, you just have to run the 11ty app as follows:

```bash
npm run build
```

This command does "hot reloading" and takes everything in the `/src` folder and builds a "production" instance and serves it up from the `/public` folder. 

One important thing to note with this command: it does _not_ clear the content of the `/public` folder between loads. So, if you made a larger change and needed to remove a file from the structure, it'll still appear in the `/public` folder. You can run the following to remove the content of the folder:

```
npm run clearbuild
```


_Advanced usage:_ 

I've also created a custom script locally that will clear the `public/` folder between reloads. You'll have to install `fswatch` and `browser-sync`. I added this to my `.zshrc` file. Feel free to use any part of this code:

```
build_site() {
  setopt localoptions rmstarsilent
  echo "Cleaning ${OUTPUT_DIR} and rebuilding site..."
  rm -rf "${OUTPUT_DIR}/*"  # Clean the output directory
  npx @11ty/eleventy --output="${OUTPUT_DIR}"  # Rebuild the site
  browser-sync reload  # Manually trigger BrowserSync to reload
}

serve_eleventy() {
  # Define the output directory
  local OUTPUT_DIR="./public"

  # Start BrowserSync in a background subshell & get its PID
  (
    cd ${OUTPUT_DIR}
    browser-sync start --server --files "${OUTPUT_DIR}/**/*" &
    echo $! > "/tmp/serve_eleventy_$$.pid"
  ) &

  # Function to execute upon exiting or interrupting the script
  cleanup() {
    echo "Stopping the server..."
    if [[ -f "/tmp/serve_eleventy_$$.pid" ]]; then
      PID=$(cat "/tmp/serve_eleventy_$$.pid")
      kill $PID
      wait $PID 2>/dev/null
      rm "/tmp/serve_eleventy_$$.pid"
    fi
  }

  # Trap script exit signals to clean up properly
  trap cleanup EXIT INT

  # Main watch and build loop
  echo "Watching for changes in src/. Press [CTRL+C] to stop..."
  fswatch -o src/ | while read f; do
    build_site
  done
}
```
## Usage/Examples

### File structure:

```
verdance-site/
|-- src/
|   |-- _data/
|   |   |-- jobs.js
|   |-- _includes/
|   |   |-- button.liquid
|   |   |-- job.liquid
|   |-- _layouts/
|   |   |-- layout.liquid
|   |-- assets/
|   |   |-- fonts/
|   |   |-- img/
|   |   |-- styles/
|   |   |-- base.scss
|   |-- pages/
|       |-- about.liquid
|       |-- careers.liquid
|       |-- index.liquid
|       |-- our-work.liquid          
|-- .eleventy.js
```

### Config

The `.eleventy.js` file is where all the "magic" happens. As you can see in the config, we're using almost no plugins or libraries -- HTML / CSS / JS native implementations have grown tremendously since the great front-end wars of the days of yore. 

There are a few things to note here:

- We're using SCSS to compile our CSS
- Any files you need to reference directly in the code needs to have an explicit `addPassthroughCopy` for the path.
- The return function here is simple, we're just mapping the folders to more common web development semantics, ie `output/` folder to `public/`

You can read more about the 11ty config file in their documentation [here](https://www.11ty.dev/docs/config/).

### HTML

We use a very simple templating language for our HTML files called Liquid. You can read more about on their official documentioned [here](https://shopify.github.io/liquid/basics/introduction/).

All of our pages are stored in the `pages/` folder. There's a section at the top that's the page's front matter. For example, here's our homepage `/`:

```
---
layout: layout.liquid
title: Verdance Homepage
permalink: /index.html
---
```

This front matter says that the page should be inserted into the `layout.liquid` template, with a page Title of "Verdance Homepage" and that the link URL should be `/index.html`. You can read more about 11ty's front matter [here](https://www.11ty.dev/docs/data-frontmatter/). 

Layouts in 11ty are larger page templates we are going to include over and over in our app. For the neat-term future, we'll most likely just have the one current one, `layout.liquid`. However, there is a `_includes` folder where we can have re-usable components. This helps contributors use pre-designed components so they don't have to re-invent the wheel every time they want to add in a CTA.

### CSS

We're using [SASS](https://sass-lang.com/documentation/) for styling since it enables some excellent features like nesting, variables and other pieces of great functionality. 

We have 4 primary SCSS files:

- normalize.scss
- foundations.scss
- shared.scss
- page.scss

#### normalize.scss

This file is purely to reset all of our CSS. Without this, browsers all apply their own default styling, from spacing to colors. You shouldn't need to generally touch this file.

#### foundations.scss

This is where the base "scaffolding" of our site's style should live. This includes fundamental things across the site like colors, fonts and media queries.


#### shared.scss

This is where styles that should be shared across components should live, like buttons, repeating sections etc.

#### page.scss

This is where page-specific CSS should live, styles that DO NOT get shared across pages.

We generally follow the [BEM methodology](https://css-tricks.com/bem-101/) when writing styles, so please adhere to that.