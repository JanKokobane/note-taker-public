import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoutePath } from "@react-navigation/native";

interface User {
  email: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await AsyncStorage.getItem("currentUser");
      if (storedUser) setUser(JSON.parse(storedUser));
      setLoading(false);
    };
    loadUser();
  }, []);


  const register = async (email: string, username: string, password: string) => {
    const usersString = await AsyncStorage.getItem("users");
    let users = usersString ? JSON.parse(usersString) : [];

  
    const exists = users.find((u: any) => u.email === email);
    if (exists) throw new Error("Email already registered");

    const newUser = { email, username, password };
    users.push(newUser);

    await AsyncStorage.setItem("users", JSON.stringify(users));
    await AsyncStorage.setItem("currentUser", JSON.stringify({ email, username }));

    setUser({ email, username });
  }

  const login = async (email: string, password: string) => {
    const userString = await AsyncStorage.getItem("users");
    const users = userString ? JSON.parse(userString) : [];

    const found = users.find(
        (u: any) => u.email === email && u.password === password
    )

    if (!found) throw new Error("Invalid email or password")
    
    await AsyncStorage.setItem(
        "currentUser",
        JSON.stringify({ email: found.email, username: found.username})
    )
    setUser({ email: found.email, username: found.username })
  }
  
  const logout = async () => {
    await AsyncStorage.removeItem("currentUser");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={({ user, loading, login, register, logout})}>
        {children}
    </AuthContext.Provider>
  )
}

export const userAuth =  () => useContext(AuthContext)