import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {contextPlugin} from '@sanity/context/studio'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'md-studio',

  projectId: '5ouc347b',
  dataset: 'production',

  plugins: [structureTool(), visionTool(), contextPlugin()],

  schema: {
    types: schemaTypes,
  },
})
