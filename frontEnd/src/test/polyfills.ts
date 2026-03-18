// Polyfill fetch for Node environment before any other imports
import { fetch, Headers, Request, Response } from 'undici'

global.fetch = fetch as any
global.Headers = Headers as any
global.Request = Request as any
global.Response = Response as any
