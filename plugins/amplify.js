import Vue from 'vue'
import Amplify from '@aws-amplify/core'
/* eslint no-unused-vars: 0 */
import Auth from '@aws-amplify/auth'
import API from '@aws-amplify/api'
import Storage from '@aws-amplify/storage'
import { Logger } from '@aws-amplify/core'
import { I18n } from "@aws-amplify/core"
import '@aws-amplify/ui-vue'
import awsExports from '../src/aws-exports'
import { AmplifyPlugin } from 'aws-amplify-vue'
import { vocabularies } from '../dictionary.js'

I18n.putVocabulariesForLanguage("ja", vocabularies);

Amplify.configure(awsExports)

Vue.use(AmplifyPlugin, { Auth, Logger, I18n, API, Storage })