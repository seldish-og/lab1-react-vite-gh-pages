import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test } from 'vitest'
import Counter from './Counter'

test('renders counter with initial count of 0', () => {
  render(<Counter />)
  
  const button = screen.getByRole('button', { name: /count is 0/i })
  expect(button).toBeInTheDocument()
})

test('increments count when button is clicked', async () => {
  const user = userEvent.setup()
  render(<Counter />)
  
  const button = screen.getByRole('button', { name: /count is 0/i })
  expect(button).toBeInTheDocument()
  
  await user.click(button)
  
  const updatedButton = screen.getByRole('button', { name: /count is 1/i })
  expect(updatedButton).toBeInTheDocument()
})

test('increments count multiple times', async () => {
  const user = userEvent.setup()
  render(<Counter />)
  
  const button = screen.getByRole('button', { name: /count is 0/i })
  
  await user.click(button)
  await user.click(button)
  await user.click(button)
  
  const updatedButton = screen.getByRole('button', { name: /count is 3/i })
  expect(updatedButton).toBeInTheDocument()
})

test('renders HMR message', () => {
  render(<Counter />)
  
  const message = screen.getByText(/Edit.*and save to test HMR/i)
  expect(message).toBeInTheDocument()
})

