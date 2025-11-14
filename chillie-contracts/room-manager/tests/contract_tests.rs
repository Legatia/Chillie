use futures::FutureExt as _;
use linera_sdk::{
    util::BlockingWait,
    views::View,
    Contract, ContractRuntime,
};
use chillie::{ChillieOperation, ChillieAbi};
use crate::ChillieContract;
use crate::state::ChillieRoomState;

#[test]
fn test_create_room_operation() {
    let initial_value = 0u64;
    let mut app = create_and_instantiate_app(initial_value);

    let result = app
        .execute_operation(ChillieOperation::CreateRoom)
        .now_or_never()
        .expect("Execution of CreateRoom should not await anything");

    assert_eq!(result, 1);
    assert_eq!(*app.state.value.get(), 1);
}

#[test]
fn test_join_room_operation() {
    let initial_value = 1u64;
    let mut app = create_and_instantiate_app(initial_value);

    let result = app
        .execute_operation(ChillieOperation::JoinRoom)
        .now_or_never()
        .expect("Execution of JoinRoom should not await anything");

    assert_eq!(result, 2);
    assert_eq!(*app.state.value.get(), 2);
}

#[test]
fn test_leave_room_operation() {
    let initial_value = 5u64;
    let mut app = create_and_instantiate_app(initial_value);

    let result = app
        .execute_operation(ChillieOperation::LeaveRoom)
        .now_or_never()
        .expect("Execution of LeaveRoom should not await anything");

    assert_eq!(result, 6);
    assert_eq!(*app.state.value.get(), 6);
}

#[test]
fn test_multiple_operations() {
    let initial_value = 0u64;
    let mut app = create_and_instantiate_app(initial_value);

    // Create room
    let result1 = app
        .execute_operation(ChillieOperation::CreateRoom)
        .now_or_never()
        .expect("Execution of CreateRoom should not await anything");
    assert_eq!(result1, 1);

    // Join room
    let result2 = app
        .execute_operation(ChillieOperation::JoinRoom)
        .now_or_never()
        .expect("Execution of JoinRoom should not await anything");
    assert_eq!(result2, 2);

    // Leave room
    let result3 = app
        .execute_operation(ChillieOperation::LeaveRoom)
        .now_or_never()
        .expect("Execution of LeaveRoom should not await anything");
    assert_eq!(result3, 3);

    assert_eq!(*app.state.value.get(), 3);
}

#[test]
fn test_instantiate_with_value() {
    let initial_value = 42u64;
    let app = create_and_instantiate_app(initial_value);
    assert_eq!(*app.state.value.get(), initial_value);
}

fn create_and_instantiate_app(initial_value: u64) -> ChillieContract {
    let runtime = ContractRuntime::new().with_application_parameters(());
    let mut contract = ChillieContract {
        state: ChillieRoomState::load(runtime.root_view_storage_context())
            .blocking_wait()
            .expect("Failed to read from mock key value store"),
        runtime,
    };

    contract
        .instantiate(initial_value)
        .now_or_never()
        .expect("Initialization of application state should not await anything");

    assert_eq!(*contract.state.value.get(), initial_value);

    contract
}