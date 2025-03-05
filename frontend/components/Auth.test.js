// 👇 START WORKING ON LINE 36 (the set up is done for you -> go straight to writing tests)
import React from 'react'
import { render, waitFor, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import server from '../../backend/mock-server'
import Auth from './Auth'

describe('Auth component', () => {
  // ❗ mock API setup
  beforeAll(() => { server.listen() })
  afterAll(() => { server.close() })

  let userInput, passInput, loginBtn // ❗ DOM nodes of interest
  let user // ❗ tool to simulate interaction with the DOM

  beforeEach(() => {
    // ❗ render the component to test
    render(<Auth />)
    // ❗ set up the user variable
    user = userEvent.setup()
    // ❗ set the DOM nodes of interest into their variables
    userInput = screen.getByPlaceholderText('type username')
    passInput = screen.getByPlaceholderText('type password')
    loginBtn = screen.getByTestId('loginBtn')
  })

  // ❗ These are the users registered in the testing database
  const registeredUsers = [
    { id: 1, username: 'Shakira', born: 1977, password: 'Suerte1977%' },
    { id: 2, username: 'Beyoncé', born: 1981, password: 'Halo1981#' },
    { id: 3, username: 'UtadaHikaru', born: 1983, password: 'FirstLove1983;' },
    { id: 4, username: 'Madonna', born: 1958, password: 'Vogue1958@' },
  ]

  test('[1] Inputs acquire the correct values when typed on', async () => {
    await user.type(userInput, 'gabe')
    expect(userInput).toHaveValue('gabe')

    await user.type(passInput, '1234')
    expect(passInput).toHaveValue('1234')
  })

  test('[2] Submitting form clicking button shows "Please wait..." message', async () => {
    await user.type(userInput, 'gabe')
    await user.type(passInput, '1234')
    await user.click(loginBtn)

    expect(screen.getByText('Please wait')).toBeVisible()
  })

  test('[3] Submitting form typing [ENTER] shows "Please wait..." message', async () => {
    await user.type(userInput, 'gabe')
    await user.type(passInput, '1234')
    await user.keyboard('[ENTER]')

    expect(screen.getByText('Please wait')).toBeVisible()
  })

  test('[4] Submitting an empty form shows "Invalid Credentials" message', async () => {
    await user.click(loginBtn)

    expect(await screen.findByText('Invalid Credentials')).toBeVisible()
  })

  test('[5] Submitting incorrect credentials shows "Invalid Credentials" message', async () => {
    await user.type(userInput, 'gabe')
    await user.type(passInput, '1234')
    await user.click(loginBtn)

    expect(await screen.findByText('Invalid Credentials')).toBeVisible()
  })

  for (const usr of registeredUsers) {
    test(`[6.${usr.id}] Logging in ${usr.username} makes the following elements render:
        - correct welcome message
        - correct user info (ID, username, birth date)
        - logout button`, async () => {
      await user.type(userInput, usr.username)
      await user.type(passInput, usr.password)
      await user.click(loginBtn)

      await waitFor(() => {
        expect(screen.getByText(`Welcome back, ${usr.username}. We LOVE you!`)).toBeVisible()
        expect(screen.getByText(`ID: ${usr.id}, username: ${usr.username}, Born: ${usr.born}`)).toBeVisible()
        expect(screen.getByTestId('Logout')).toBeVisible()
      })
    })
  }

  test('[7] Logging out a logged-in user displays goodbye message and renders form', async () => {
    const { username, password } = registeredUsers[0]
    await user.type(userInput, username)
    await user.type(passInput, password)
    await user.click(loginBtn)

    await screen.findByText(`Welcome back, ${username}. We LOVE you!`)

    await user.click(screen.getByTestId('logoutBtn'))

    expect(await screen.findByText('Bye! Please, come back soon.')).toBeVisible()
    expect(screen.getByTestId('loginForm')).toBeVisible()
    screen.debug()
  })
})
