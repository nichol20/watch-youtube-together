import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter, useLocation } from 'react-router-dom'
import { CreateRoom } from '..'

const LocationDisplay = () => {
  const location = useLocation()

  return <div data-testid="location-display">{location.pathname}</div>
}

describe('CreateRoom', () => {
  it('should create a room', () => {
    render(<CreateRoom />, { wrapper: BrowserRouter })
    
    const createRoomButton = screen.getByRole('button', {
      name: /Create a Room/i
    })
    
    userEvent.click(createRoomButton)

    render(<LocationDisplay />, { wrapper: BrowserRouter })

    expect(screen.getByTestId('location-display')).toHaveTextContent('/rooms/')
    
  })

  it('should join a room', () => {
    render(<CreateRoom />, {wrapper: BrowserRouter})

    const joinButton = screen.getByRole('button', {
      name: /Join a Room/i
    })

    const joinInput = screen.getByTestId('input-to-insert-room-id')

    userEvent.type(joinInput, 'teste')
    userEvent.click(joinButton)

    render(<LocationDisplay />, { wrapper: BrowserRouter })
    
    expect(screen.getByTestId('location-display')).toHaveTextContent('/rooms/teste')
  })
})