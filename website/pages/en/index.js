/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react')

const CompLibrary = require('../../core/CompLibrary.js')

const MarkdownBlock = CompLibrary.MarkdownBlock /* Used to read markdown */
const Container = CompLibrary.Container
const GridBlock = CompLibrary.GridBlock

class HomeSplash extends React.Component {
  render() {
    const { siteConfig } = this.props
    const { downloadUrls } = siteConfig

    const SplashContainer = props => (
      <div className="homeContainer">
        <div className="homeSplashFade">
          <div className="wrapper homeWrapper">{props.children}</div>
        </div>
      </div>
    )

    const ProjectTitle = () => (
      <h2 className="projectTitle">
        {siteConfig.title}
        <small>{siteConfig.tagline}</small>
      </h2>
    )

    const PromoSection = props => (
      <div className="section promoSection">
        <div className="promoRow">
          <div className="pluginRowBlock">{props.children}</div>
        </div>
      </div>
    )

    const Button = props => (
      <div className="pluginWrapper buttonWrapper">
        <a className="button" href={props.href} target={props.target}>
          {props.children}
        </a>
      </div>
    )

    return (
      <SplashContainer>
        <div className="inner">
          <ProjectTitle siteConfig={siteConfig} />
          <PromoSection>
            <Button href={downloadUrls.chrome}>
              <i className="fab fa-padding fa-chrome" />
              Chrome Download
            </Button>
            <Button href={downloadUrls.firefox}>
              <i className="fab fa-padding fa-firefox" />
              Firefox Download
            </Button>
            <Button href={downloadUrls.github}>
              <i className="fas fa-padding fa-file-archive" />
              Latest zip
            </Button>
          </PromoSection>
          <a
            className="github-button"
            href={this.props.siteConfig.repoUrl}
            data-icon="octicon-star"
            data-count-href="/seleniumhq/selenium-ide/stargazers"
            data-show-count="true"
            data-count-aria-label="# stargazers on GitHub"
            aria-label="Star this project on GitHub"
          >
            Star
          </a>
        </div>
      </SplashContainer>
    )
  }
}

class Index extends React.Component {
  render() {
    const { config: siteConfig, language = '' } = this.props
    const { baseUrl, docsUrl, downloadUrls } = siteConfig
    const docsPart = `${docsUrl ? `${docsUrl}/` : ''}`
    const langPart = `${language ? `${language}/` : 'en/'}`
    const _docUrl = doc => `${baseUrl}${docsPart}${langPart}${doc}`

    const Block = props => (
      <Container
        padding={['bottom', 'top']}
        id={props.id}
        background={props.background}
      >
        <GridBlock contents={props.children} layout={props.layout} />
      </Container>
    )

    const Features = () => (
      <Container padding={['bottom', 'top']} background="light">
        <GridBlock
          layout="threeColumn"
          background="light"
          align="center"
          contents={[
            {
              content: `With the [Command-line runner for Selenium IDE](${_docUrl(
                'command-line-runner'
              )}) you can run your Selenium IDE tests in parallel, headlessly, on different brower & OS combinations, and connect it to a CI server.`,
              image: `${baseUrl}img/parallel-execution.png`,
              imageAlign: 'top',
              title: 'Fast Cross-browser Execution',
            },
            {
              content:
                'Selenium IDE records multiple locators for each element it interacts with. If one locator fails during playback, the other locators will be tried until one is succesful.',
              image: `${baseUrl}img/fallback.png`,
              imageAlign: 'top',
              title: 'Reslient Tests',
            },
            {
              content: `Through the use of the [run command](${_docUrl(
                'commands#run'
              )}), you can re-use one test case insidie of another (e.g., allowing you to re-use your login logic in multiple places throughout a suite).`,
              image: `${baseUrl}img/reuse.png`,
              imageAlign: 'top',
              title: 'Test Case Reuse',
            },
            {
              content: `Extend Selenium IDE through the use of [plugins](${'plugins-getting-started'}). You can write plugins that will introduce new commands to the IDE or integrate it with a third-party service.`,
              image: `${baseUrl}img/plugins.png`,
              imageAlign: 'top',
              title: 'Plugins',
            },
            {
              content: `Download Selenium IDE for either [Chrome](${
                downloadUrls.chrome
              }) or [Firefox](${downloadUrls.firefox}) and get started.`,
              image: `${baseUrl}img/browsers.png`,
              imageAlign: 'top',
              title: 'Support for Chrome and Firefox',
            },
          ]}
        />
      </Container>
    )

    const FeatureCallout = () => (
      <div
        className="productShowcaseSection paddingBottom"
        style={{ textAlign: 'center' }}
      >
        <h2>Ready to use IDE</h2>
        <MarkdownBlock>
          The IDE requires no additional setup other than installing the
          extension on your browser. One of our driving philosophies is to
          provide an easy to use tool, that will give instant feedback. We
          believe that the easier we can make it, the better results the IDE
          will have.
        </MarkdownBlock>
      </div>
    )

    const Debugger = () => (
      <Block background="light">
        {[
          {
            content:
              'Selenium IDE packs with it rich IDE features, including setting breakpoints, pausing on exceptions and more.',
            image: `${baseUrl}img/debugger.png`,
            imageAlign: 'right',
            title: 'Test Automation IDE',
          },
        ]}
      </Block>
    )

    const ControlFlow = () => (
      <Block>
        {[
          {
            content:
              'Selenium IDE comes shipped with an extensive [control flow](control-flow-getting-started) structure, no more `gotos` and the likes, from now on `ifs`, `whiles` and `times` out of the box.',
            image: `${baseUrl}img/control-flow.png`,
            imageAlign: 'left',
            title: 'Control Flow',
          },
        ]}
      </Block>
    )

    const Runner = () => (
      <Block background="light">
        {[
          {
            content:
              "The [selenium-side-runner](runner-getting-started) is a feature packed test framework built on top of Selenium IDE. It let's you run tests in parallel, on different browsers, on Selenium Grid or on remove WebDriver instances.",
            image: `${baseUrl}img/runner.png`,
            imageAlign: 'right',
            title: 'Selenium IDE Runner',
          },
        ]}
      </Block>
    )

    const TryOut = () => (
      <Block id="try">
        {[
          {
            content:
              '[Dave](https://twitter.com/tourdedave) explaining the ins-and-outs of the IDE',
            image: `${baseUrl}img/selenium-ide128.png`,
            imageAlign: 'left',
            title: 'Try it Out',
          },
        ]}
      </Block>
    )

    const Showcase = () => {
      if ((siteConfig.users || []).length === 0) {
        return null
      }

      const showcase = siteConfig.users
        .filter(user => user.pinned)
        .map(user => (
          <a href={user.infoLink} key={user.infoLink}>
            <img src={user.image} alt={user.caption} title={user.caption} />
          </a>
        ))

      const pageUrl = page => baseUrl + (language ? `${language}/` : '') + page

      return (
        <div className="productShowcaseSection paddingBottom">
          <h2>Who is Using This?</h2>
          <p>This project is used by all these people</p>
          <div className="logos">{showcase}</div>
          <div className="more-users">
            <a className="button" href={pageUrl('users.html')}>
              More {siteConfig.title} Users
            </a>
          </div>
        </div>
      )
    }

    return (
      <div>
        <HomeSplash siteConfig={siteConfig} language={language} />
        <div className="mainContainer">
          <Features />
          <FeatureCallout />
          <Debugger />
          <ControlFlow />
          <Runner />
          <TryOut />
          <Showcase />
        </div>
      </div>
    )
  }
}

module.exports = Index
