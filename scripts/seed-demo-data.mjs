#!/usr/bin/env node
/**
 * Seed script: dummy docs + test users (user1–3, admin1–3) with different access.
 * Run with: node scripts/seed-demo-data.mjs
 * Requires: Wiki.js server running on BASE_URL (default http://localhost:3000)
 * Admin login: ADMIN_EMAIL / ADMIN_PASSWORD (default admin@example.com / NewPass123!)
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'NewPass123!'
const ADMIN_PASSWORD_FIRST_RUN = process.env.ADMIN_PASSWORD_FIRST_RUN || '12345678'
const LOCAL_AUTH_ID = '5a528c4c-0a82-4ad2-96a5-2b23811e6588'

const defaultRule = (id, extraRoles = []) => ({
  id,
  name: 'Default Rule',
  mode: 'ALLOW',
  match: 'START',
  roles: ['read:pages', 'read:assets', 'read:comments', 'write:comments', ...extraRoles],
  path: '',
  locales: [],
  sites: []
})

async function gql (query, variables = {}, token = null) {
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  }
  const res = await fetch(`${BASE_URL}/_graphql`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables })
  })
  const json = await res.json()
  if (json.errors && json.errors.length) {
    throw new Error(json.errors.map(e => e.message).join('; '))
  }
  return json.data
}

async function login (siteId) {
  for (const pwd of [ADMIN_PASSWORD, ADMIN_PASSWORD_FIRST_RUN]) {
    const data = await gql(`
      mutation Login($username: String!, $password: String!, $strategyId: UUID!, $siteId: UUID!) {
        login(username: $username, password: $password, strategyId: $strategyId, siteId: $siteId) {
          operation { succeeded message }
          jwt
          nextAction
          continuationToken
          redirect
        }
      }
    `, {
      username: ADMIN_EMAIL,
      password: pwd,
      strategyId: LOCAL_AUTH_ID,
      siteId
    })
    const token = data?.login?.jwt
    if (token) return token
  }
  throw new Error('Login failed – check ADMIN_EMAIL / ADMIN_PASSWORD. If this is first run, complete the "change password" step in the UI, then set ADMIN_PASSWORD to the new password and re-run.')
}

async function main () {
  console.log('Fetching site and logging in...')
  const sitesData = await gql(`
    query { sites { id hostname } }
  `)
  const sites = sitesData?.sites || []
  if (!sites.length) throw new Error('No sites found')
  const siteId = sites[0].id
  console.log('Site ID:', siteId)

  let token
  try {
    token = await login(siteId)
  } catch (e) {
    console.error('Login failed:', e.message)
    console.error('If this is a fresh install, log in once in the UI as admin@example.com, complete the "change password" step, then run:')
    console.error('  ADMIN_PASSWORD=YourNewPassword node scripts/seed-demo-data.mjs')
    process.exit(1)
  }
  console.log('Logged in as admin.')

  // ----- Groups -----
  const groupsData = await gql(`query { groups { id name permissions } }`, {}, token)
  const groups = groupsData.groups || []
  const adminGroup = groups.find(g => g.name === 'Administrators')
  const usersGroup = groups.find(g => g.name === 'Users')
  if (!adminGroup || !usersGroup) throw new Error('Administrators or Users group not found')

  let editorsGroupId
  let viewersGroupId
  const existingEditors = groups.find(g => g.name === 'Editors')
  const existingViewers = groups.find(g => g.name === 'Viewers')
  if (existingEditors) {
    editorsGroupId = existingEditors.id
    console.log('  ✓ Editors group (existing)')
  } else {
    const create = await gql(`
      mutation CreateGroup($name: String!) {
        createGroup(name: $name) { group { id } operation { succeeded message } }
      }
    `, { name: 'Editors' }, token)
    if (!create?.createGroup?.operation?.succeeded) throw new Error(create?.createGroup?.operation?.message || 'Create Editors failed')
    editorsGroupId = create.createGroup.group.id
    const ruleId = crypto.randomUUID()
    await gql(`
      mutation UpdateGroup($id: UUID!, $name: String!, $redirectOnLogin: String!, $permissions: [String]!, $rules: [GroupRuleInput]!) {
        updateGroup(id: $id, name: $name, redirectOnLogin: $redirectOnLogin, permissions: $permissions, rules: $rules) {
          operation { succeeded message }
        }
      }
    `, {
      id: editorsGroupId,
      name: 'Editors',
      redirectOnLogin: '/',
      permissions: ['read:pages', 'read:assets', 'read:comments', 'write:comments', 'write:pages'],
      rules: [defaultRule(ruleId, ['write:pages'])]
    }, token)
    console.log('  ✓ Editors group (created)')
  }
  if (existingViewers) {
    viewersGroupId = existingViewers.id
    console.log('  ✓ Viewers group (existing)')
  } else {
    const create = await gql(`
      mutation CreateGroup($name: String!) {
        createGroup(name: $name) { group { id } operation { succeeded message } }
      }
    `, { name: 'Viewers' }, token)
    if (!create?.createGroup?.operation?.succeeded) throw new Error(create?.createGroup?.operation?.message || 'Create Viewers failed')
    viewersGroupId = create.createGroup.group.id
    console.log('  ✓ Viewers group (created)')
  }

  // ----- Users -----
  const password = 'TestPass123!'
  const userSpecs = [
    { name: 'User One', email: 'user1@example.com', groups: [usersGroup.id] },
    { name: 'User Two', email: 'user2@example.com', groups: [usersGroup.id, editorsGroupId] },
    { name: 'User Three', email: 'user3@example.com', groups: [viewersGroupId] },
    { name: 'Admin One', email: 'admin1@example.com', groups: [adminGroup.id] },
    { name: 'Admin Two', email: 'admin2@example.com', groups: [adminGroup.id] },
    { name: 'Admin Three', email: 'admin3@example.com', groups: [adminGroup.id] }
  ]
  for (const u of userSpecs) {
    const existing = await gql(`
      query Users($filter: String) { users(filter: $filter, pageSize: 5) { users { id email } } }
    `, { filter: u.email }, token)
    const found = existing?.users?.users?.find(x => x.email === u.email)
    if (found) {
      console.log('  ✓', u.email, '(existing)')
      continue
    }
    await gql(`
      mutation CreateUser($email: String!, $name: String!, $password: String!, $groups: [UUID]!, $mustChangePassword: Boolean!, $sendWelcomeEmail: Boolean!) {
        createUser(email: $email, name: $name, password: $password, groups: $groups, mustChangePassword: $mustChangePassword, sendWelcomeEmail: $sendWelcomeEmail) {
          operation { succeeded message }
        }
      }
    `, {
      email: u.email,
      name: u.name,
      password,
      groups: u.groups,
      mustChangePassword: false,
      sendWelcomeEmail: false
    }, token)
    console.log('  ✓', u.email)
  }

  // ----- Pages (dummy docs) -----
  const pages = [
    { path: 'welcome', title: 'Welcome', description: 'Welcome to the wiki', content: `# Welcome\n\nThis is a **dummy doc** so you can see the wiki in action.\n\n- Browse the sidebar\n- Try logging in as different users to see access differences\n- user1: Users only | user2: Users + Editors (can edit) | user3: Viewers only\n- admin1/admin2/admin3: full admin` },
    { path: 'getting-started', title: 'Getting Started', description: 'Quick start guide', content: `# Getting Started\n\n1. Log in with one of the test accounts.\n2. **user1** – read-only (Users).\n3. **user2** – can edit pages (Editors).\n4. **user3** – view only (Viewers).\n5. **admin1 / admin2 / admin3** – full admin (same password as below).\n\nAll test user passwords: \`TestPass123!\`` },
    { path: 'api-overview', title: 'API Overview', description: 'API summary', content: `# API Overview\n\nDummy content for an API overview page.\n\n- REST and GraphQL\n- Authentication\n- Rate limits` },
    { path: 'team/roles', title: 'Team Roles', description: 'Who does what', content: `# Team Roles\n\n- **Viewers**: read-only.\n- **Users**: read + comments.\n- **Editors**: read + edit pages.\n- **Administrators**: full access.` }
  ]
  for (const p of pages) {
    try {
      await gql(`
        mutation CreatePage(
          $siteId: UUID!, $path: String!, $title: String!, $description: String!, $content: String!,
          $locale: String!, $editor: String!, $publishState: PagePublishState!
        ) {
          createPage(
            siteId: $siteId, path: $path, title: $title, description: $description, content: $content,
            locale: $locale, editor: $editor, publishState: $publishState
          ) { operation { succeeded message } }
        }
      `, {
        siteId,
        path: p.path,
        title: p.title,
        description: p.description,
        content: p.content,
        locale: 'en',
        editor: 'markdown',
        publishState: 'published'
      }, token)
      console.log('  ✓', p.path)
    } catch (err) {
      if (err.message && err.message.includes('ERR_PAGE_DUPLICATE_PATH')) {
        console.log('  ✓', p.path, '(existing)')
      } else {
        throw err
      }
    }
  }

  console.log('\nDone. Summary:')
  console.log('  Test users (password for all): TestPass123!')
  console.log('  user1@example.com  – Users (read + comments)')
  console.log('  user2@example.com  – Users + Editors (can edit pages)')
  console.log('  user3@example.com  – Viewers (read-only)')
  console.log('  admin1@example.com – Administrators')
  console.log('  admin2@example.com – Administrators')
  console.log('  admin3@example.com – Administrators')
  console.log('  Dummy pages: /welcome, /getting-started, /api-overview, /team/roles')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
