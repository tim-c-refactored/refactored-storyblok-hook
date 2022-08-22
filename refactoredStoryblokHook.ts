import React, { useState, useEffect } from "react"
// @ts-ignore
import StoryblokClient from "storyblok-js-client"

let sbClient = new StoryblokClient({
  accessToken: process.env.STORYBLOK_TOKEN
})

function loadBridge(callback:any) {
  const existingScript = document.getElementById("storyblokBridge");
  if (!existingScript) {
    const script = document.createElement("script");
    script.src = "//app.storyblok.com/f/storyblok-v2-latest.js";
    script.id = "storyblokBridge";
    document.body.appendChild(script);
    script.onload = () => {
      callback();
    };
  } else {
    callback();
  }
}

function RefactoredUseStoryblok(initialStory:any) {
  const [story,setStory] = useState(parseStory(initialStory))

  function parseStory(story:any):any {
    if(typeof story.content === "string") {
      let newStory = {
        ...story,
        content: JSON.parse(story.content)
      }
      return newStory
    }
    return story
  }

  useEffect(()=>{
    if(window.location.search.includes('_storyblok')) {
      loadBridge(() => {
        const { StoryblokBridge, location } = window
        const storyblokInstance = new StoryblokBridge()

        storyblokInstance.on(['published', 'change'], (event:any) => {
          if (!event.slugChanged) {
            location.reload()
          }
        })

        storyblokInstance.on('input', (event:any) => {
          // Access currently changed but not yet saved content via:
          setStory(parseStory(event.story))
        })

        storyblokInstance.on('enterEditmode', (event:any) => {
          // loading the draft version on initial enter of editor
          sbClient
            .get(`cdn/stories/${event.storyId}`, {
              version: 'draft',
            })
            .then(({ data }) => {
              setStory(parseStory(data.story))
            })
            .catch((error) => {
              console.error(error);
            }) 
          }) 
      })
    }

    if(typeof story.content === "string") {
      setStory(parseStory(story))
    }
  },[])

  return story
}


export default RefactoredUseStoryblok
