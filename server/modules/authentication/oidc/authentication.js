const _ = require('lodash')

// ------------------------------------
// OpenID Connect Account
// ------------------------------------

const OpenIDConnectStrategy = require('passport-openidconnect').Strategy

module.exports = {
  init (passport, strategyId, config) {
    const conf = {
      key: strategyId,
      callbackURL: (typeof WIKI !== 'undefined' && WIKI.config?.host)
        ? `${WIKI.config.host.replace(/\/$/, '')}/login/${strategyId}/callback`
        : (config.callbackURL || `/login/${strategyId}/callback`),
      ...config
    }
    passport.use(conf.key,
      new OpenIDConnectStrategy({
        authorizationURL: conf.authorizationURL,
        tokenURL: conf.tokenURL,
        clientID: conf.clientId,
        clientSecret: conf.clientSecret,
        issuer: conf.issuer,
        userInfoURL: conf.userInfoURL,
        callbackURL: conf.callbackURL,
        passReqToCallback: true
      }, async (req, iss, sub, profile, cb) => {
        try {
          const externalGroups = (conf.groupsClaim && profile._json)
            ? (_.get(profile._json, conf.groupsClaim) || [])
            : []
          const groupMapping = conf.groupMapping || {}
          const user = await WIKI.db.users.processProfile({
            providerKey: req.params.strategy,
            profile: {
              ...profile,
              email: _.get(profile, '_json.' + (conf.emailClaim || 'email'))
            },
            externalGroups: Array.isArray(externalGroups) ? externalGroups : [externalGroups],
            groupMapping
          })
          cb(null, user)
        } catch (err) {
          cb(err, null)
        }
      })
    )
  },
  logout (conf) {
    if (!conf || !conf.logoutURL) {
      return '/'
    }
    return conf.logoutURL
  }
}
