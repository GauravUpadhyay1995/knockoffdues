import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { UserData } from '@/types/index';

export const useUserData = (userId: string) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [departments, setDepartments] = useState<Array<{ _id: string; name: string }>>([]);
  const [roleList, setRoleList] = useState<Array<{ _id: string; role: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [userRes, deptRes, roleListResp] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/profile/${userId}`),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/departments/list?perPage=all`),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/roles/active-list?perPage=all`)
      ]);

      const mockUser = userRes.data.data;
      const roleList = Array.isArray(roleListResp.data.data)
        ? roleListResp.data.data
        : roleListResp.data.data?.roles || [];

      const deptArray = Array.isArray(deptRes.data.data)
        ? deptRes.data.data
        : deptRes.data.data?.departments || [];

      setUser(mockUser);
      setDepartments(deptArray);
      setRoleList(roleList);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Failed to load user data");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { user, departments, roleList, loading, error, refresh: fetchData };
};
