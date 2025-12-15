"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Shield, Users, Settings, Save, RotateCcw, Trash2, Plus } from "lucide-react";
import Swal from 'sweetalert2';
const api = {
    updateAllRolePermissions: async (data: any) => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/permissions/`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
            credentials: "include"
        });
        if (!res.ok) throw new Error("Failed to save all permissions");
        return res.json();
    },

    // delete a role's permission document
    deleteRolePermissions: async (role: string) => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/permissions`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ role }),
        });
        if (!res.ok) throw new Error("Failed to delete role permissions");
        return res.json();
    },
    // Add new API for deleting module permissions
    deleteModulePermissions: async (moduleName: string) => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/permissions/modules`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ module: moduleName }),
        });
        if (!res.ok) throw new Error("Failed to delete module permissions");
        return res.json();
    }
};

export default function PermissionSetting({ roles = [], modules: modulesProp = {}, rolePermissions: rpProp = {} }: any) {
    const [selectedRole, setSelectedRole] = useState<string | null>(roles[0] || null);
    const [selectedModule, setSelectedModule] = useState<string | null>(Object.keys(modulesProp)[0] || null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [saveStatus, setSaveStatus] = useState<null | "success" | "error">(null);
    const [modules, setModules] = useState(() => JSON.parse(JSON.stringify(modulesProp || {})));
    const [rolePermissionsState, setRolePermissionsState] = useState(() => JSON.parse(JSON.stringify(rpProp || {})));
    const [originalRolePermissions, setOriginalRolePermissions] = useState(() => JSON.parse(JSON.stringify(rpProp || {})));
    const [isAddModuleOpen, setIsAddModuleOpen] = useState(false);
    const [newModuleName, setNewModuleName] = useState("");
    const [newModulePermsText, setNewModulePermsText] = useState("");
    const [assignRoles, setAssignRoles] = useState(() => roles ? roles.map((r: string) => ({ role: r, checked: false })) : []);
    const [roleFilter, setRoleFilter] = useState("");
    const [moduleFilter, setModuleFilter] = useState("");


    const filteredRoles = (roles || []).filter((role: string) =>
        role.toLowerCase().includes(roleFilter.toLowerCase())
    );

    const filteredModules = Object.keys(modules || {}).filter((m: string) =>
        m.toLowerCase().includes(moduleFilter.toLowerCase())
    );


    // Safeguard — ensure every role has an array
    useEffect(() => {
        setRolePermissionsState(prev => {
            const next = { ...prev };
            (roles || []).forEach((r: string) => {
                if (!next[r]) next[r] = [];
            });
            return next;
        });

        setOriginalRolePermissions(prev => {
            const next = { ...prev };
            (roles || []).forEach((r: string) => {
                if (!next[r]) next[r] = [];
            });
            return next;
        });

        // if selectedRole is null -> set to first role
        if (!selectedRole && roles && roles.length) setSelectedRole(roles[0]);

        // if selectedModule was removed or null, pick first
        if (!selectedModule) {
            const keys = Object.keys(modules);
            setSelectedModule(keys[0] || null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roles]);

    // keep local modules in sync if prop changes
    useEffect(() => {
        setModules(JSON.parse(JSON.stringify(modulesProp || {})));
        // ensure selectedModule remains valid
        const keys = Object.keys(modulesProp || {});
        if (!keys.includes(selectedModule || "")) {
            setSelectedModule(keys[0] || null);
        }
    }, [modulesProp]); // eslint-disable-line

    // Safely read current permissions for selected role
    const permissions = (selectedRole && rolePermissionsState[selectedRole]) ? rolePermissionsState[selectedRole] : [];

    // Change detection across all roles
    const hasChanges = JSON.stringify(rolePermissionsState) !== JSON.stringify(originalRolePermissions);

    // ---------- CORE ACTIONS (unchanged logic) ----------
    const togglePermission = (perm: string) => {
        if (!selectedRole) return;
        setRolePermissionsState(prev => ({
            ...prev,
            [selectedRole]: (prev[selectedRole] || []).includes(perm)
                ? (prev[selectedRole] || []).filter((p: string) => p !== perm)
                : [...(prev[selectedRole] || []), perm],
        }));
    };

    const handleSelectAll = () => {
        if (!selectedModule || !selectedRole) return;
        const all = modules[selectedModule] || [];
        setRolePermissionsState(prev => ({
            ...prev,
            [selectedRole]: [...new Set([...(prev[selectedRole] || []), ...all])]
        }));
    };

    const handleDeselectAll = () => {
        if (!selectedModule || !selectedRole) return;
        const all = modules[selectedModule] || [];
        setRolePermissionsState(prev => ({
            ...prev,
            [selectedRole]: (prev[selectedRole] || []).filter((p: string) => !all.includes(p))
        }));
    };

    const handleSaveAllPermissions = async () => {
        if (!hasChanges) return;
        setIsSubmitting(true);
        setSaveStatus(null);
        try {
            await api.updateAllRolePermissions(rolePermissionsState);
            setOriginalRolePermissions(JSON.parse(JSON.stringify(rolePermissionsState)));
            setSaveStatus("success");
            setTimeout(() => setSaveStatus(null), 2500);
        } catch (err) {
            console.error(err);
            setSaveStatus("error");
            setTimeout(() => setSaveStatus(null), 4000);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResetPermissions = () => {
        setRolePermissionsState(JSON.parse(JSON.stringify(originalRolePermissions)));
        setSaveStatus(null);
    };

    // Delete role permissions document
    const handleDeleteRolePermissions = async (role: string) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Delete all permissions saved for role "${role}"? This cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });
        if (result.isConfirmed) {
            try {
                const deleteResult = await api.deleteRolePermissions(role);
                // remove locally too
                setRolePermissionsState(prev => {
                    const next = { ...prev };
                    delete next[role];
                    return next;
                });
                setOriginalRolePermissions(prev => {
                    const next = { ...prev };
                    delete next[role];
                    return next;
                });
                const msg = deleteResult.success === true ? setSaveStatus("success") : setSaveStatus('error')

                setTimeout(() => setSaveStatus(null), 2500);
            } catch (err) {
                console.error(err);
                setSaveStatus("error");
            }

        }



    };
    // Delete module permissions from all roles
    const handleDeleteModulePermissions = async (moduleName: string) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Delete all permissions for module "${moduleName}" from all roles? This cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                setIsSubmitting(true);

                // Call backend API to delete module permissions
                const deleteResult = await api.deleteModulePermissions(moduleName);

                if (deleteResult.success) {
                    // 1. Remove module from modules object
                    const updatedModules = { ...modules };
                    delete updatedModules[moduleName];
                    setModules(updatedModules);

                    // 2. Remove module permissions from all roles
                    const updatedRolePerms = { ...rolePermissionsState };
                    const modulePerms = modules[moduleName] || [];

                    Object.keys(updatedRolePerms).forEach(role => {
                        if (updatedRolePerms[role] && Array.isArray(updatedRolePerms[role])) {
                            updatedRolePerms[role] = updatedRolePerms[role].filter(
                                (perm: string) => !modulePerms.includes(perm)
                            );
                        }
                    });

                    // 3. Update state
                    setRolePermissionsState(updatedRolePerms);
                    setOriginalRolePermissions(JSON.parse(JSON.stringify(updatedRolePerms)));

                    // 4. Update selectedModule if it was the deleted one
                    if (selectedModule === moduleName) {
                        const remainingModules = Object.keys(updatedModules);
                        setSelectedModule(remainingModules[0] || null);
                    }

                    setSaveStatus("success");
                    setTimeout(() => setSaveStatus(null), 2500);
                } else {
                    setSaveStatus("error");
                }

            } catch (err) {
                console.error(err);
                setSaveStatus("error");
                setTimeout(() => setSaveStatus(null), 4000);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    useEffect(() => {
        setAssignRoles(roles ? roles.map((r: string) => ({ role: r, checked: false })) : []);
    }, [roles]);

    const toggleAssignRole = (role: string) => {
        setAssignRoles(prev => prev.map((r: any) => r.role === role ? { ...r, checked: !r.checked } : r));
    };
    useEffect(() => {
        if (newModuleName.trim()) {
            const moduleKey = newModuleName.toLowerCase().trim().replace(/\s+/g, '_');
            const crudPermissions = [
                `${moduleKey}.create`,
                `${moduleKey}.read`,
                `${moduleKey}.update`,
                `${moduleKey}.delete`
            ];
            setNewModulePermsText(crudPermissions.join(', '));
        }
    }, [newModuleName]);
    // Add module locally and optionally persist to backend (assign to selected roles)
    const addModule = async ({ saveNow = false } = {}) => {
        const moduleName = newModuleName.trim();
        if (!moduleName) return alert("Module name is required");

        // Use the generated CRUD permissions
        const perms = newModulePermsText
            .split(",")
            .map(p => p.trim())
            .filter(Boolean);

        if (!perms.length) {
            alert("Add at least one permission.");
            return;
        }

        // 1️⃣ Build updated MODULES
        const updatedModules = {
            ...modules,
            [moduleName]: perms
        };

        // 2️⃣ Build updated ROLE PERMISSIONS (MANUALLY)
        const rolesToAssign = assignRoles.filter((r: any) => r.checked).map((r: any) => r.role);

        // if none selected assign module to currently selected role
        const targets = rolesToAssign.length ? rolesToAssign : [selectedRole].filter(Boolean);

        const updatedRolePerms = JSON.parse(JSON.stringify(rolePermissionsState));

        targets.forEach((role: string) => {
            if (!updatedRolePerms[role]) updatedRolePerms[role] = [];
            updatedRolePerms[role] = [...new Set([...updatedRolePerms[role], ...perms])];
        });

        // 3️⃣ Update state immediately
        setModules(updatedModules);
        setRolePermissionsState(updatedRolePerms);

        // 4️⃣ SAVE TO BACKEND
        if (saveNow) {
            try {
                setIsSubmitting(true);
                await api.updateAllRolePermissions(updatedRolePerms); // ✅ USE UPDATED VALUES
                setOriginalRolePermissions(JSON.parse(JSON.stringify(updatedRolePerms)));
                setSaveStatus("success");
            } catch (error) {
                console.error(error);
                setSaveStatus("error");
            } finally {
                setIsSubmitting(false);
                setTimeout(() => setSaveStatus(null), 3000);
            }
        }

        // Reset modal
        setIsAddModuleOpen(false);
        setNewModuleName("");
        setNewModulePermsText("");
    };

    // ensure selectedModule exists if modules change
    useEffect(() => {
        if (!selectedModule) {
            const keys = Object.keys(modules || {});
            setSelectedModule(keys[0] || null);
        } else {
            const keys = Object.keys(modules || {});
            if (!keys.includes(selectedModule)) {
                setSelectedModule(keys[0] || null);
            }
        }
    }, [modules, selectedModule]);

    // Small presentational components used below
    const Pill = ({ children }: any) => (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/6 backdrop-blur-sm border border-white/8 text-emerald-200">{children}</span>
    );

    const SectionCard = ({ children, title, icon }: any) => (
        <div className="relative backdrop-blur-2xl bg-gray-700 dark:bg-white/5 border border-white/8 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-5 border-b border-white/6 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/6">
                        {icon}
                    </div>
                    <h3 className="text-sm font-semibold text-white">{title}</h3>
                </div>
            </div>
            <div className="p-1">{children}</div>
        </div>
    );

    return (
        <div className="">
            <div className="max-w-7xl mx-auto">
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-4 relative">
                    <div className="absolute -inset-1 blur-lg opacity-70  dark:opacity-30 rounded-2xl bg-[linear-gradient(90deg,#7c3aed,#06b6d4,#ef4444)] " />

                    <div className="relative rounded-2xl p-4 bg-gradient-to-r from-white/3 to-white/2 border border-white/6 backdrop-blur-2xl shadow-2xl">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="rounded-full bg-white dark:bg-white/6 p-3">
                                    <Shield className="w-8 h-8 text-purple-900 dark:text-purple-300" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-extrabold text-gray-700 dark:text-white">Role & Permission Manager</h1>
                                    <p className="text-sm text-purple-900 dark:text-purple-200 mt-1">Manage access control with precision</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <AnimatePresence>
                                    {saveStatus && (
                                        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${saveStatus === "success" ? "bg-emerald-600/20 text-emerald-200 border border-emerald-600/30" : "bg-red-600/20 text-red-200 border border-red-600/30"}`}>
                                            {saveStatus === "success" ? (<><Check className="w-4 h-4" /> Saved</>) : (<><span>⚠️</span> Error</>)}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <button onClick={() => setIsAddModuleOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg hover:scale-105 transform transition">
                                    <Plus className="w-4 h-4" /> Add Module
                                </button>
                            </div>
                        </div>
                    </div>

                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Roles */}
                    <SectionCard title="Roles" icon={<Users className="w-6 h-6 text-cyan-300" />}>
                        <div className="max-h-83 overflow-y-auto space-y-2">
                            {(roles || []).map((role: string) => (
                                <motion.div layout key={role} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} onClick={() => setSelectedRole(role)} className={`cursor-pointer p-3 rounded-xl flex items-center justify-between transition-all ${selectedRole === role ? 'bg-gradient-to-r from-purple-600/40 to-pink-600/40 text-white font-semibold shadow-inner' : 'bg-white/3 hover:bg-white/6 text-gray-200'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/6 text-white/90 font-bold capitalize">{role[0]}</div>
                                        <div className="capitalize">{role}</div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Trash2 title="Delete" onClick={(e) => { e.stopPropagation(); handleDeleteRolePermissions(role); }} className="w-4 h-4" />
                                        {selectedRole === role && <div className="w-3 h-3 bg-emerald-400 rounded-full" />}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </SectionCard>

                    {/* Modules */}
                    {/* Modules Section */}
                    <SectionCard title="Modules" icon={<Settings className="w-6 h-6 text-yellow-300" />}>
                        <div className="max-h-83 overflow-y-auto space-y-2">
                            {Object.keys(modules || {}).map((m: string) => (
                                <motion.div
                                    layout
                                    key={m}
                                    initial={{ opacity: 0, x: -6 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0 }}
                                    className={`cursor-pointer p-3 rounded-xl flex items-center justify-between transition-all ${selectedModule === m ? 'bg-gradient-to-r from-blue-600/40 to-cyan-600/40 text-white font-semibold shadow-inner' : 'bg-white/3 hover:bg-white/6 text-gray-200'}`}
                                >
                                    <div className="flex items-center gap-3 flex-1" onClick={() => setSelectedModule(m)}>
                                        <div className="capitalize flex-1">{m}</div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Trash2
                                            title={`Delete module ${m}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteModulePermissions(m);
                                            }}
                                            className="w-4 h-4 text-red-300 hover:text-red-400 cursor-pointer"
                                        />
                                        {selectedModule === m && <div className="w-3 h-3 bg-cyan-400 rounded-full" />}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </SectionCard>

                    {/* Permissions */}
                    <SectionCard title="Permissions" icon={<Save className="w-6 h-6 text-emerald-300" />}>
                        {/* <Pill>{selectedModule || '—'}</Pill> */}
                        <div className="flex items-center justify-between mb-3">
                            {/* <div className="flex items-center gap-2">
                              
                                <div className="text-xs text-gray-300">Selected Role: <span className="ml-1 font-semibold capitalize">{selectedRole || '—'}</span></div>
                            </div> */}

                            <div className="flex items-center gap-2">
                                <button onClick={handleSelectAll} className="text-gray-300 dark:text-white px-3 py-1 rounded-lg text-sm bg-emerald-500/10 border border-emerald-500/20">Select All</button>
                                <button onClick={handleDeselectAll} className="text-gray-300 dark:text-white  px-3 py-1 rounded-lg text-sm bg-red-500/10 border border-red-500/20">Deselect All</button>
                            </div>
                        </div>

                        <div className="p-1 rounded-lg bg-white/3 max-h-83 overflow-y-auto">
                            <AnimatePresence>
                                {isLoading ? (
                                    <div className="space-y-3 p-3">
                                        {[...Array(5)].map((_, i) => (<div key={i} className="h-10 bg-white/6 rounded-lg animate-pulse" />))}
                                    </div>
                                ) : (
                                    (modules[selectedModule || ''] || []).map((perm: string) => (
                                        <motion.label layout key={perm} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-4 cursor-pointer p-3 rounded-lg hover:bg-white/6 transition-colors">
                                            <div className="relative flex-shrink-0">
                                                <input aria-label={`toggle-${perm}`} type="checkbox" checked={permissions.includes(perm)} onChange={() => togglePermission(perm)} className="sr-only" />
                                                <div className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all ${permissions.includes(perm) ? 'bg-emerald-500 border-emerald-500 shadow' : 'bg-white/6 border-white/10'}`}>
                                                    {permissions.includes(perm) && (<Check className="w-4 h-4 text-white" />)}
                                                </div>
                                            </div>

                                            <div className="flex-1">
                                                <div className="text-sm text-gray-100 font-medium capitalize">{perm.replace('.', ' ')}</div>
                                                <div className="text-xs text-gray-400 mt-0.5">{perm}</div>
                                            </div>
                                        </motion.label>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>
                    </SectionCard>
                </div>

                {/* Action Buttons */}
                <div>
                    {hasChanges && (
                        <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleResetPermissions} className={` fixed bottom-6 right-46 px-6 py-3 font-medium rounded-full shadow-2xl ${hasChanges ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white' : 'bg-white/6 text-gray-300 cursor-not-allowed border border-white/6'}`}>
                            Reset
                        </motion.button>
                    )}

                    <motion.button type="button" disabled={isSubmitting || !hasChanges} whileHover={{ scale: hasChanges ? 1.02 : 1 }} whileTap={{ scale: hasChanges ? 0.98 : 1 }} onClick={handleSaveAllPermissions} className={`fixed bottom-6 right-6 px-6 py-3 font-medium rounded-full shadow-2xl ${hasChanges ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white' : 'bg-white/6 text-gray-300 cursor-not-allowed border border-white/6'}`}>
                        {isSubmitting ? "Saving..." : (<> {hasChanges ? 'Save Changes' : 'No Changes'}</>)}
                    </motion.button>
                </div>

                {/* Add Module Modal */}
                <AnimatePresence>
                    {isAddModuleOpen && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAddModuleOpen(false)} />

                            <motion.div initial={{ scale: 0.98, y: 8, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.98, y: 8, opacity: 0 }} className="relative w-full max-w-2xl rounded-2xl p-6 bg-gradient-to-br from-white/4 to-white/6 border border-white/8 backdrop-blur-3xl shadow-2xl">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Create Module & Assign Permissions</h3>
                                        <p className="text-sm text-gray-300 mt-1">Add a new module and optionally assign its permissions to roles.</p>
                                    </div>

                                    <button onClick={() => setIsAddModuleOpen(false)} className="text-gray-300 hover:text-white">Close</button>
                                </div>

                                <div className="mt-4 space-y-3">
                                    <div>
                                        <label className="block text-sm text-gray-300 mb-1">Module Name</label>
                                        <input value={newModuleName} onChange={e => setNewModuleName(e.target.value)} className="w-full p-3 rounded-lg bg-white/6 border border-white/8 text-white placeholder-gray-400" placeholder="e.g., project management" />
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-300 mb-1">Permissions (comma separated)</label>
                                        <textarea value={newModulePermsText} onChange={e => setNewModulePermsText(e.target.value)} className="w-full p-3 rounded-lg bg-white/6 border border-white/8 text-white placeholder-gray-400" placeholder="project.view, project.add, project.edit" rows={3} />
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-300 mb-1">Assign to roles</label>
                                        <div className="max-h-36 overflow-y-auto border border-white/8 p-3 rounded-lg bg-black/10">
                                            {assignRoles.map(ar => (
                                                <label key={ar.role} className="flex items-center gap-2 text-white mb-2">
                                                    <input type="checkbox" checked={ar.checked} onChange={() => toggleAssignRole(ar.role)} />
                                                    <span className="capitalize">{ar.role}</span>
                                                </label>
                                            ))}
                                            <div className="text-xs text-gray-400 mt-1">If no roles selected, permissions will be assigned to the currently selected role.</div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 justify-end mt-3">
                                        <button onClick={() => setIsAddModuleOpen(false)} className="px-3 py-2 rounded-lg bg-white/6 text-white">Cancel</button>
                                        <button onClick={() => addModule({ saveNow: false })} className="px-3 py-2 rounded-lg bg-blue-600 text-white">Add (local)</button>
                                        <button onClick={() => addModule({ saveNow: true })} className="px-3 py-2 rounded-lg bg-emerald-500 text-white">Add & Save</button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
}
