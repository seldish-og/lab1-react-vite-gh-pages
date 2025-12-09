import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, test, vi } from 'vitest'
import UserTable from './UserTable'

// Мокируем глобальный fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('UserTable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders button and does not show table initially', () => {
    render(<UserTable />)
    expect(screen.getByText(/загрузить пользователей/i)).toBeInTheDocument()
    expect(screen.queryByText(/иван/i)).not.toBeInTheDocument()
  })

  test('loads users and displays them when button is clicked', async () => {
    const user = userEvent.setup()
    const mockUsers = [
      {
        id: 1,
        name: 'Иван Иванов',
        email: 'ivan@example.com',
        phone: '+7 (999) 123-45-67',
        website: 'example.com',
      },
    ]

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockUsers,
    })

    render(<UserTable />)
    const button = screen.getByText(/загрузить пользователей/i)
    await user.click(button)

    expect(await screen.findByText(/иван иванов/i)).toBeInTheDocument()
    expect(screen.getByText(/ivan@example.com/i)).toBeInTheDocument()
    expect(screen.getByText(/\+7 \(999\) 123-45-67/i)).toBeInTheDocument()
    // Проверяем наличие ссылки на сайт
    const websiteLink = screen.getByRole('link', { name: /example.com/i })
    expect(websiteLink).toBeInTheDocument()
    expect(websiteLink).toHaveAttribute('href', 'http://example.com')
  })

  test('shows error when fetch fails', async () => {
    const user = userEvent.setup()
    mockFetch.mockRejectedValue(new Error('Network error'))

    render(<UserTable />)
    const button = screen.getByText(/загрузить пользователей/i)
    await user.click(button)

    // Компонент показывает текст ошибки из err.message
    expect(await screen.findByText(/network error/i)).toBeInTheDocument()
  })

  test('shows loading state when fetching', async () => {
    const user = userEvent.setup()
    const mockUsers = [
      {
        id: 1,
        name: 'Иван Иванов',
        email: 'ivan@example.com',
        phone: '+7 (999) 123-45-67',
        website: 'example.com',
      },
    ]

    // Создаем промис, который можно контролировать
    let resolvePromise: (value: any) => void
    const controlledPromise = new Promise((resolve) => {
      resolvePromise = resolve
    })

    mockFetch.mockReturnValue(controlledPromise.then(() => ({
      ok: true,
      json: async () => mockUsers,
    })))

    render(<UserTable />)
    const button = screen.getByText(/загрузить пользователей/i)
    await user.click(button)

    // Проверяем, что показывается состояние загрузки
    expect(screen.getByText(/загрузка\.\.\./i)).toBeInTheDocument()
    expect(button).toBeDisabled()

    // Разрешаем промис
    resolvePromise!(undefined)
    await screen.findByText(/иван иванов/i)

    // После загрузки кнопка должна быть снова активна
    expect(screen.getByText(/загрузить пользователей/i)).toBeInTheDocument()
  })

  test('shows error when HTTP response is not ok', async () => {
    const user = userEvent.setup()
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
    })

    render(<UserTable />)
    const button = screen.getByText(/загрузить пользователей/i)
    await user.click(button)

    expect(await screen.findByText(/HTTP error! status: 500/i)).toBeInTheDocument()
  })

  test('filters users by email when searching with 3+ characters', async () => {
    const user = userEvent.setup()
    const mockUsers = [
      {
        id: 1,
        name: 'Leanne Graham',
        email: 'Sincere@april.biz',
        phone: '1-770-736-8031 x56442',
        website: 'hildegard.org',
      },
      {
        id: 2,
        name: 'Ervin Howell',
        email: 'Ervin@melissa.tv',
        phone: '010-692-6593 x09125',
        website: 'anastasia.net',
      },
      {
        id: 3,
        name: 'Clementine Bauch',
        email: 'Nathan@yesenia.net',
        phone: '1-463-123-4447',
        website: 'ramiro.info',
      },
    ]

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockUsers,
    })

    render(<UserTable />)
    const button = screen.getByText(/загрузить пользователей/i)
    await user.click(button)

    // Ждем загрузки пользователей
    await screen.findByText(/leanne graham/i)

    // Проверяем, что все пользователи отображаются
    expect(screen.getByText(/Sincere@april.biz/i)).toBeInTheDocument()
    expect(screen.getByText(/Ervin@melissa.tv/i)).toBeInTheDocument()
    expect(screen.getByText(/Nathan@yesenia.net/i)).toBeInTheDocument()

    // Находим поле поиска и вводим "apr" (3+ символов для активации фильтрации)
    const searchInput = screen.getByPlaceholderText(/поиск по email/i)
    await user.clear(searchInput)
    await user.type(searchInput, 'apr')

    // Проверяем, что отфильтрованы только пользователи с "apr" в email
    // "apr" должно найти "Sincere@april.biz" (содержит "apr" в "april")
    expect(screen.getByText(/Sincere@april.biz/i)).toBeInTheDocument()
    expect(screen.getByText(/leanne graham/i)).toBeInTheDocument()
    
    // Остальные пользователи не должны отображаться
    expect(screen.queryByText(/Ervin@melissa.tv/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Nathan@yesenia.net/i)).not.toBeInTheDocument()
  })

  test('filters users by email when input "ap" (3+ characters requirement)', async () => {
    const user = userEvent.setup()
    const mockUsers = [
      {
        id: 1,
        name: 'Leanne Graham',
        email: 'Sincere@april.biz',
        phone: '1-770-736-8031 x56442',
        website: 'hildegard.org',
      },
      {
        id: 2,
        name: 'Ervin Howell',
        email: 'Ervin@melissa.tv',
        phone: '010-692-6593 x09125',
        website: 'anastasia.net',
      },
      {
        id: 3,
        name: 'Clementine Bauch',
        email: 'Nathan@yesenia.net',
        phone: '1-463-123-4447',
        website: 'ramiro.info',
      },
    ]

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockUsers,
    })

    render(<UserTable />)
    const button = screen.getByText(/загрузить пользователей/i)
    await user.click(button)

    // Ждем загрузки пользователей
    await screen.findByText(/leanne graham/i)

    // Проверяем, что все пользователи отображаются
    expect(screen.getByText(/Sincere@april.biz/i)).toBeInTheDocument()
    expect(screen.getByText(/Ervin@melissa.tv/i)).toBeInTheDocument()
    expect(screen.getByText(/Nathan@yesenia.net/i)).toBeInTheDocument()

    // Находим поле поиска и вводим "ap" (2 символа - фильтрация не применяется)
    const searchInput = screen.getByPlaceholderText(/поиск по email/i)
    await user.clear(searchInput)
    await user.type(searchInput, 'ap')

    // При вводе "ap" (2 символа) фильтрация не применяется, все пользователи остаются
    expect(screen.getByText(/Sincere@april.biz/i)).toBeInTheDocument()
    expect(screen.getByText(/Ervin@melissa.tv/i)).toBeInTheDocument()
    expect(screen.getByText(/Nathan@yesenia.net/i)).toBeInTheDocument()

    // Добавляем еще один символ, чтобы получить "apr" (3 символа)
    await user.type(searchInput, 'r')

    // Теперь фильтрация применяется - только пользователь с "apr" в email
    expect(screen.getByText(/Sincere@april.biz/i)).toBeInTheDocument()
    expect(screen.getByText(/leanne graham/i)).toBeInTheDocument()
    
    // Остальные пользователи не должны отображаться
    expect(screen.queryByText(/Ervin@melissa.tv/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Nathan@yesenia.net/i)).not.toBeInTheDocument()
  })

  test('shows "Ничего не найдено" when search has no results', async () => {
    const user = userEvent.setup()
    const mockUsers = [
      {
        id: 1,
        name: 'Leanne Graham',
        email: 'Sincere@april.biz',
        phone: '1-770-736-8031 x56442',
        website: 'hildegard.org',
      },
    ]

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockUsers,
    })

    render(<UserTable />)
    const button = screen.getByText(/загрузить пользователей/i)
    await user.click(button)

    // Ждем загрузки пользователей
    await screen.findByText(/leanne graham/i)

    // Вводим поисковый запрос, который не найдет результатов
    const searchInput = screen.getByPlaceholderText(/поиск по email/i)
    await user.type(searchInput, 'xyz123')

    // Проверяем, что показывается "Ничего не найдено"
    expect(await screen.findByText(/ничего не найдено/i)).toBeInTheDocument()
    expect(screen.queryByText(/leanne graham/i)).not.toBeInTheDocument()
  })

  test('does not filter when search query is less than 3 characters', async () => {
    const user = userEvent.setup()
    const mockUsers = [
      {
        id: 1,
        name: 'Leanne Graham',
        email: 'Sincere@april.biz',
        phone: '1-770-736-8031 x56442',
        website: 'hildegard.org',
      },
      {
        id: 2,
        name: 'Ervin Howell',
        email: 'Shanna@melissa.tv',
        phone: '010-692-6593 x09125',
        website: 'anastasia.net',
      },
    ]

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockUsers,
    })

    render(<UserTable />)
    const button = screen.getByText(/загрузить пользователей/i)
    await user.click(button)

    // Ждем загрузки пользователей
    await screen.findByText(/leanne graham/i)

    // Вводим только 2 символа
    const searchInput = screen.getByPlaceholderText(/поиск по email/i)
    await user.type(searchInput, 'ap')

    // Проверяем, что все пользователи все еще отображаются (фильтрация не применяется)
    expect(screen.getByText(/Sincere@april.biz/i)).toBeInTheDocument()
    expect(screen.getByText(/Shanna@melissa.tv/i)).toBeInTheDocument()
  })
})

