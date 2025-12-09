import { useState } from 'react'
import { mockUsers, type User } from '../data/mockUsers'

export default function UserTable() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      // Имитация асинхронной загрузки с моковыми данными
      await new Promise((resolve) => setTimeout(resolve, 300))
      setUsers(mockUsers)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка')
    } finally {
      setLoading(false)
    }
  }

  // Фильтрация пользователей по email (при вводе 3+ символов)
  const filteredUsers =
    searchQuery.length >= 3
      ? users.filter((user) =>
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : users

  return (
    <div className="user-table-container">
      <button onClick={fetchUsers} disabled={loading}>
        {loading ? 'Загрузка...' : 'Загрузить пользователей'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {users.length > 0 && (
        <>
          <input
            type="text"
            placeholder="Поиск по email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              marginTop: '20px',
              padding: '8px',
              width: '100%',
              maxWidth: '400px',
              display: 'block',
            }}
          />
          {filteredUsers.length === 0 ? (
            <p style={{ marginTop: '20px' }}>Ничего не найдено</p>
          ) : (
            <table
              border={1}
              style={{ marginTop: '20px', borderCollapse: 'collapse', width: '100%' }}
            >
              <thead>
                <tr>
                  <th>Имя</th>
                  <th>Email</th>
                  <th>Телефон</th>
                  <th>Сайт</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.phone}</td>
                    <td>
                      <a href={`http://${user.website}`} target="_blank" rel="noopener noreferrer">
                        {user.website}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  )
}

