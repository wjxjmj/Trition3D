use cadmium::message::{Message, MessageResult};
use cadmium::project::Project;

#[tauri::command]
fn project_new(name: String) -> Result<String, String> {
    let p = Project::new(&name);
    Ok(serde_json::to_string(&p).map_err(|e| e.to_string())?)
}

#[tauri::command]
fn project_from_json(json: String) -> Result<String, String> {
    let p = Project::from_json(&json);
    Ok(serde_json::to_string(&p).map_err(|e| e.to_string())?)
}

#[tauri::command]
fn project_to_json(project_json: String) -> Result<String, String> {
    let p: Project = serde_json::from_str(&project_json).map_err(|e| e.to_string())?;
    Ok(p.json())
}

#[tauri::command]
fn project_send_message(project_json: String, message_json: String) -> Result<String, String> {
    let mut p: Project = serde_json::from_str(&project_json).map_err(|e| e.to_string())?;
    let msg: Message = serde_json::from_str(&message_json).map_err(|e| e.to_string())?;

    match msg.handle(&mut p) {
        Ok(result) => {
            let project_str = serde_json::to_string(&p).map_err(|e| e.to_string())?;
            Ok(serde_json::json!({
                "project": project_str,
                "result": result
            }).to_string())
        }
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
fn project_get_workbench(project_json: String, index: u32) -> Result<String, String> {
    let p: Project = serde_json::from_str(&project_json).map_err(|e| e.to_string())?;
    let wb = &p.workbenches[index as usize];
    Ok(wb.json())
}

#[tauri::command]
fn project_get_realization(project_json: String, workbench_id: u32, max_steps: u32) -> Result<String, String> {
    let p: Project = serde_json::from_str(&project_json).map_err(|e| e.to_string())?;
    let realized = p.get_realization(workbench_id as u64, max_steps as u64);
    Ok(serde_json::to_string(&realized).map_err(|e| e.to_string())?)
}

#[tauri::command]
fn project_compute_constraint_errors(project_json: String) -> Result<String, String> {
    let mut p: Project = serde_json::from_str(&project_json).map_err(|e| e.to_string())?;
    p.compute_constraint_errors();
    Ok(serde_json::to_string(&p).map_err(|e| e.to_string())?)
}

#[tauri::command]
fn solid_to_obj(realization_json: String, solid_name: String, tolerance: f64) -> Result<String, String> {
    use cadmium::realization::Realization;
    let r: Realization = serde_json::from_str(&realization_json).map_err(|e| e.to_string())?;
    Ok(r.solid_to_obj(&solid_name, tolerance))
}

#[tauri::command]
fn solid_to_step(realization_json: String, solid_name: String) -> Result<String, String> {
    use cadmium::realization::Realization;
    let r: Realization = serde_json::from_str(&realization_json).map_err(|e| e.to_string())?;
    Ok(r.solid_to_step(&solid_name))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            project_new,
            project_from_json,
            project_to_json,
            project_send_message,
            project_get_workbench,
            project_get_realization,
            project_compute_constraint_errors,
            solid_to_obj,
            solid_to_step,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
