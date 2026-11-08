import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Store...
import useChallanStore from "../store/ChallanStore";

export const useChallanHook = () => {
    const navigate = useNavigate();
    const { getAllChallan, generateChallanNo, createChallan, deleteChallan, updateChallan } = useChallanStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

};