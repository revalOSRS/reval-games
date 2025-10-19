import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { membersApi, LoginRequest } from '@/api/members'

export function useLogin() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: LoginRequest) => membersApi.login(data),
    onSuccess: (response, variables) => {
      // Store member data in localStorage with the original code
      localStorage.setItem('user', JSON.stringify({
        memberId: response.data.id,
        code: variables.code,
        profile: response.data
      }))
      navigate('/menu')
    },
  })
}

export function useLogout() {
  const navigate = useNavigate()

  return () => {
    localStorage.removeItem('user')
    navigate('/')
  }
}

export function getStoredUser() {
  try {
    const userData = localStorage.getItem('user')
    return userData ? JSON.parse(userData) : null
  } catch {
    return null
  }
}

