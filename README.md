# Next.js Voice Agent Starter

Start building interactive voice experiences with Deepgram's Voice Agent API using Python Flask starter application. This project demonstrates how to create a voice agent that can engage in natural conversations using Deepgram's advanced AI capabilities.

## What is Deepgram?

[Deepgram's](https://deepgram.com/) voice AI platform provides APIs for speech-to-text, text-to-speech, and full speech-to-speech voice agents. Over 200,000+ developers use Deepgram to build voice AI products and features.


## Sign-up to Deepgram

Before you start, it's essential to generate a Deepgram API key to use in this project. [Sign-up now for Deepgram and create an API key](https://console.deepgram.com/signup?jump=keys).

## Prerequisites

Before you start, you'll need:
- Node.js (version 18 or higher)
- npm or yarn package manager
- A Deepgram API key ([Sign-up now for Deepgram](https://console.deepgram.com/signup?jump=keys))

## Quickstart

### Manual Setup

Follow these steps to get started with this starter application.

#### Clone the repository

Go to GitHub and [clone the repository](https://github.com/deepgram-starters/nextjs-voice-agent-starter.git).

#### Install dependencies

Install the project dependencies:

```bash
npm install
```

#### Configure your environment

Create a `.env` file by copying the contents from `sample.env`:

```bash
cp sample.env .env
```

Then edit the `.env` file and replace the placeholder with your actual Deepgram API key:

```bash
DEEPGRAM_API_KEY=your_deepgram_api_key_here
```

You can get your API key from the [Deepgram Console](https://console.deepgram.com/).

#### Run the application

There are two ways to run this starter application:

**Development Mode:**
```bash
npm run dev
```

**Web Server Mode:**
```bash
npm run start
```

Once running, you can access the application in your browser at `http://localhost:3000` (development) or the port specified for server mode.

- Allow microphone access when prompted.
- Speak into your microphone to interact with the Deepgram Voice Agent.
- You should hear the agent's responses played back in your browser.

### Using the `app-requirements.mdc` File

1. Clone or Fork this repo.
2. Modify the `app-requirements.mdc`
3. Add the necessary configuration settings in the file.
4. You can refer to the MDC file used to help build this starter application by reviewing  [app-requirements.mdc](.cursor/rules/app-requirements.mdc)

## Testing

```bash
npm test
```
## Getting Help

We love to hear from you so if you have questions, comments or find a bug in the project, let us know! You can either:

- [Open an issue in this repository](https://github.com/deepgram-starters/nextjs-voice-agent-starter/issues/new)
- [Join the Deepgram Github Discussions Community](https://github.com/orgs/deepgram/discussions)
- [Join the Deepgram Discord Community](https://discord.gg/deepgram)

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](./CONTRIBUTING.md) for details on how to get started.

## Security

For security concerns and vulnerability reporting, please refer to our [Security Policy](./SECURITY.md).

## Code of Conduct

This project adheres to the Deepgram [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Author

[Deepgram](https://deepgram.com)

## License

This project is licensed under the MIT license. See the [LICENSE](./LICENSE) file for more info.